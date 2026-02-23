// Cart management — integrated with backend API
import { api } from '../../../services/ecommerce_services/api.js';

const token = localStorage.getItem('authToken');
const headers = {
  'Content-Type': 'application/json',
  'apikey': 'thread',
  ...(token && { 'Authorization': `Bearer ${token}` })
};

/** ✅ Get cart items */
export async function getCart() {
  try {
    const response = await api('/cart/items', { method: 'GET', headers });
    const data = await response.json().catch(() => ({}));
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
}

/** ✅ Add item to cart */
export async function addToCart(variantId, quantity = 1) {
  try {
    // Check if item already exists in cart
    const cartItems = await getCart();
    const existingItem = cartItems.find(item => item.variant_id === parseInt(variantId));

    if (existingItem) {
      const newQuantity = existingItem.quantity + parseInt(quantity);
      return await updateCartItem(variantId, newQuantity);
    }

    const response = await api('/cart/add', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        variantId: parseInt(variantId),
        quantity: parseInt(quantity)
      })
    });

    const resData = await response.json().catch(() => ({}));
    return { success: resData.success ?? false, message: resData.message ?? 'Failed to add to cart' };


  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: error.message };
  }
}

/** ✅ Update cart item quantity */
export async function updateCartItem(variantId, quantity) {
  try {
    const response = await api('/cart/update', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        variantId: parseInt(variantId),
        quantity: parseInt(quantity)
      })
    });

    const resData = await response.json().catch(() => ({}));
    console.log('Updated cart item:', resData);
    return { success: resData.success ?? false, message: resData.message ?? '' };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, message: error.message };
  }
}

/** ✅ Remove item from cart */
export async function removeFromCart(variantId) {
  try {
    const response = await api('/cart/remove', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ variantId: parseInt(variantId) })
    });

    const resData = await response.json().catch(() => ({}));
    console.log('Removed from cart:', resData);
    return { success: resData.success ?? false, message: resData.message ?? '' };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: error.message };
  }
}

/** ✅ Clear all items in cart */
export async function clearCart() {
  try {
    const cartItems = await getCart();
    const results = await Promise.all(cartItems.map(item => removeFromCart(item.variant_id)));
    const success = results.every(result => result.success);
    return { success, message: success ? 'Cart cleared' : 'Some items could not be removed' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: error.message };
  }
}

/** ✅ Legacy localStorage (deprecated) */
export function getCartLocal() {
  try {
    const cart = localStorage.getItem('cart_items');
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error('Error loading local cart:', e);
    return [];
  }
}

export function saveCartLocal(items) {
  try {
    localStorage.setItem('cart_items', JSON.stringify(items));
    return true;
  } catch (e) {
    console.error('Error saving local cart:', e);
    return false;
  }
}

export default { getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartLocal, saveCartLocal };
