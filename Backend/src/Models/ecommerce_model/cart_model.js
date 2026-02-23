import { connect } from "../../core/database.js";

class CartModel {
    constructor() {
        this.connect();
    }

    async connect() {
        this.db = await connect();
    }

 

    /** 🔹 Get or create cart for user + community */
    async getOrCreateCart(userId) {
        const [rows] = await this.db.execute(
            `SELECT cart_id FROM carts WHERE user_id = ?`,
            [userId]
        );
        if (rows.length > 0) return rows[0].cart_id;

        const [insert] = await this.db.execute(
            `INSERT INTO carts (user_id) VALUES (?)`,
            [userId]
        );
        return insert.insertId;
    }

    /** 🔹 Get cart items (include product and variant info) */
    async getCartItems(userId) {
        await this.validateAccess(userId);
        const cartId = await this.getOrCreateCart(userId);

        const query = `
            SELECT ci.item_id, ci.quantity, pv.variant_id, pv.variant_name, pv.variant_values, pv.price,
                   p.product_id, p.name AS product_name, p.image_url AS image_url
            FROM cart_items ci
            JOIN product_variants pv ON ci.variant_id = pv.variant_id
            JOIN products p ON pv.product_id = p.product_id
            WHERE ci.cart_id = ?
        `;
        const [rows] = await this.db.execute(query, [cartId]);
        return rows;
    }

    /** 🔹 Add item to cart (by variant) with stock check */
    async addItem(userId, variantId, quantity = 1) {
       
        const cartId = await this.getOrCreateCart(userId);

        // Check if variant exists and get stock
        const [variantRows] = await this.db.execute(
            `SELECT stock, product_id FROM product_variants WHERE variant_id = ?`,
            [variantId]
        );
        if (variantRows.length === 0) throw new Error("Variant not found");
        const stock = variantRows[0].stock;

        // Get current quantity of this variant in cart
        const [exist] = await this.db.execute(
            `SELECT item_id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?`,
            [cartId, variantId]
        );
        const currentQtyInCart = exist.length > 0 ? exist[0].quantity : 0;

        // Validate requested quantity against stock
        if (currentQtyInCart + quantity > stock) {
            throw new Error(`Requested quantity exceeds stock. Available: ${stock - currentQtyInCart}`);
        }

        // Update existing item or insert new one
        if (exist.length > 0) {
            await this.db.execute(
                `UPDATE cart_items SET quantity = quantity + ? WHERE item_id = ?`,
                [quantity, exist[0].item_id]
            );
            return { message: "Quantity updated" };
        } else {
            await this.db.execute(
                `INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)`,
                [cartId, variantId, quantity]
            );
            return { message: "Item added" };
        }
    }


    /** 🔹 Update item quantity (by variant) with stock check */
    async updateItem(userId, variantId, quantity) {
        await this.validateAccess(userId);
        const cartId = await this.getOrCreateCart(userId);

        const [variantRows] = await this.db.execute(
            `SELECT stock FROM product_variants WHERE variant_id = ?`,
            [variantId]
        );
        if (variantRows.length === 0) throw new Error("Variant not found");

        const stock = variantRows[0].stock;
        if (quantity > stock) throw new Error(`Requested quantity exceeds stock. Available: ${stock}`);

        await this.db.execute(
            `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND variant_id = ?`,
            [quantity, cartId, variantId]
        );
        return { message: "Item updated" };
    }



    /** 🔹 Remove item (by variant) */
    async removeItem(userId, variantId) {
        await this.validateAccess(userId);
        const cartId = await this.getOrCreateCart(userId);

        await this.db.execute(
            `DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?`,
            [cartId, variantId]
        );
        return { message: "Item removed" };
    }

    // Basic access validation — ensure we have a userId from auth middleware
    async validateAccess(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return true;
    }
}

export default new CartModel();
