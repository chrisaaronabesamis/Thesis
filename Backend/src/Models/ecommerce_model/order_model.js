import { connect } from '../../core/database.js';

class OrderModel {
  constructor() {
    this.connect();
  }

  async connect() {
    this.db = await connect();
  }

  /**
   * Create order and order items in a transaction.
   * Decreases variant stock and removes corresponding cart items.
   * Returns created order id.
   */
  async createOrder(userId, communityId, payload) {
    await this.connect();
    const conn = this.db;
    try {
      await conn.beginTransaction();

      const shippingAddress = JSON.stringify(payload.shipping_address || {});

      let orderRes;
      if (communityId === null || typeof communityId === 'undefined') {
        // Insert without community_id column
        [orderRes] = await conn.execute(
          `INSERT INTO orders (user_id, subtotal, shipping_fee, total, payment_method, shipping_address, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, payload.subtotal || 0, payload.shipping_fee || 0, payload.total || 0, payload.payment_method || null, shippingAddress, payload.status || 'pending']
        );
      } else {
        [orderRes] = await conn.execute(
          `INSERT INTO orders (user_id, community_id, subtotal, shipping_fee, total, payment_method, shipping_address, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, communityId, payload.subtotal || 0, payload.shipping_fee || 0, payload.total || 0, payload.payment_method || null, shippingAddress, payload.status || 'pending']
        );
      }

      const orderId = orderRes.insertId;

      // Insert order items and decrement stock
      for (const item of payload.items) {
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        // Insert order item
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.variant_id, qty, price, qty * price]
        );

        // Check stock
        const [variantRows] = await conn.execute(`SELECT stock FROM product_variants WHERE variant_id = ? FOR UPDATE`, [item.variant_id]);
        if (!variantRows || variantRows.length === 0) {
          throw new Error(`Variant not found: ${item.variant_id}`);
        }
        const stock = Number(variantRows[0].stock || 0);
        if (stock < qty) {
          throw new Error(`Insufficient stock for variant ${item.variant_id}. Available: ${stock}`);
        }

        // Decrement stock
        await conn.execute(`UPDATE product_variants SET stock = stock - ? WHERE variant_id = ?`, [qty, item.variant_id]);
      }

      // Remove items from user's cart (if exists)
      // Try to remove items from user's cart. If communityId provided, prefer cart matching community; otherwise remove from any cart for user.
      let cartRows;
      if (communityId === null || typeof communityId === 'undefined') {
        [cartRows] = await conn.execute(`SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1`, [userId]);
      } else {
        [cartRows] = await conn.execute(`SELECT cart_id FROM carts WHERE user_id = ? AND community_id = ? LIMIT 1`, [userId, communityId]);
      }

      if (cartRows && cartRows.length > 0) {
        const cartId = cartRows[0].cart_id;
        const variantIds = payload.items.map(i => i.variant_id);
        if (variantIds.length > 0) {
          // Delete by variant ids
          const placeholders = variantIds.map(() => '?').join(',');
          await conn.execute(`DELETE FROM cart_items WHERE cart_id = ? AND variant_id IN (${placeholders})`, [cartId, ...variantIds]);
        }
      }

      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  }

  async getOrdersByUser(userId, communityId = null) {
    await this.connect();
    let query, params;
    
    if (communityId) {
      // Get orders for specific community
      query = `SELECT * FROM orders WHERE user_id = ? AND community_id = ? ORDER BY created_at DESC`;
      params = [userId, communityId];
    } else {
      // Get all orders for user across all communities
      query = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
      params = [userId];
    }
    
    const [rows] = await this.db.execute(query, params);
    
    // Get order items for each order with product and variant details
    for (const order of rows) {
      const [items] = await this.db.execute(`
        SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image,
          pv.variant_name,
          pv.variant_values as size
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }
    
    return rows;
  }

  async getOrderById(orderId, userId = null) {
    await this.connect();
    const params = [orderId];
    let q = `SELECT * FROM orders WHERE order_id = ?`;
    if (userId) {
      q += ` AND user_id = ?`;
      params.push(userId);
    }
    const [orders] = await this.db.execute(q, params);
    if (!orders || orders.length === 0) return null;
    const order = orders[0];

    const [items] = await this.db.execute(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.image_url as product_image,
        pv.variant_name,
        pv.variant_values as size
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
      WHERE oi.order_id = ?
    `, [orderId]);
    order.items = items;
    return order;
  }
}

export default new OrderModel();
