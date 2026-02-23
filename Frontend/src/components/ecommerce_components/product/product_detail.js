import fetchProductDetails from '../../../services/ecommerce_services/shop/product_details.js';
import { addToCart } from '../cart/cart.js';
import '../../../styles/ecommerce_styles/product_details.css';

// Toast notification helper function - centered
function showToastNotification(title, subtitle) {
  try {
    console.log('Showing toast notification:', title, subtitle); // Debug log
    
    let container = document.querySelector('#global-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-toast-container';
      container.className = 'global-toast-container';
      // Center the container
      container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 99999;
        pointer-events: none;
      `;
      document.body.appendChild(container);
      console.log('Created toast container'); // Debug log
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 320px;
      max-width: 400px;
      background: linear-gradient(180deg, #ffffff, #FFF7FB);
      color: #222;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      border-left: 5px solid #22c55e;
      transform: scale(0.8) translateY(-20px);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
      pointer-events: auto;
    `;
    
    toast.innerHTML = `
      <div style="background: #22c55e; color: #fff; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 700; font-size: 22px; flex-shrink: 0;">✓</div>
      <div style="flex: 1;">
        <strong style="color: #0b6b2b; display: block; font-size: 16px; font-weight: 600;">${title}</strong>
        <p style="font-size: 14px; color: #333; margin-top: 4px; margin-bottom: 0;">${subtitle}</p>
      </div>
      <button class="toast-close" style="background: none; border: none; color: #999; font-size: 22px; cursor: pointer; margin-left: auto; padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; line-height: 1; flex-shrink: 0;">&times;</button>
    `;
    
    container.appendChild(toast);
    console.log('Added toast to container'); // Debug log
    
    // Force reflow and animate in
    toast.offsetHeight; // Force reflow
    setTimeout(() => {
      toast.style.transform = 'scale(1) translateY(0)';
      toast.style.opacity = '1';
      console.log('Animated toast in'); // Debug log
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'scale(0.8) translateY(-20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
        // Remove container if empty
        if (container && container.children.length === 0) {
          container.remove();
        }
      }, 300);
    }, 3000);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.style.transform = 'scale(0.8) translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
          if (container && container.children.length === 0) {
            container.remove();
          }
        }, 300);
      });
    }
  } catch (error) {
    console.error('Error showing toast notification:', error);
    // Fallback to alert if toast fails
    alert(`${title}\n${subtitle}`);
  }
}

// Test function - remove this after testing
window.testToast = () => {
  showToastNotification('Test Toast', 'This is a test notification');
  console.log('Test toast called');
};

export default async function ProductDetail(root, productId) {
  try {
    root.innerHTML = `<div class="loading">Loading product...</div>`;

    const { product, variants } = await fetchProductDetails(productId);

    if (!product) {
      root.innerHTML = `<p class="error">Product not found.</p>`;
      return;
    }

    const img = product.img_url || product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '';
    let selectedVariant = variants.length > 0 ? variants[0] : null;

    root.innerHTML = `
      <section class="product-detail">
        <button id="back-to-shop" class="btn-link">
          <span class="back-arrow" aria-hidden="true"></span>
          <span class="back-label">Back to shop</span>
        </button>
        <div class="product-detail-grid">
          <div class="product-media">
            <img src="${img}" alt="${product.name || ''}" class="product-detail-img" />
          </div>
          <div class="product-meta">
            <h2>${product.name || ''}</h2>
            <p class="product-price">₱ ${product.price || selectedVariant?.price || ''}</p>
            <p class="product-desc">${product.description || ''}</p>

            <h4>Variants</h4>
            <div class="variant-options">
              ${variants.map((v, idx) => `
                <button class="variant-option ${idx === 0 ? 'active' : ''}" data-variant-id="${v.product_variant_id || v.id || idx}">
                  ${v.name || v.variant_values || 'Variant'}<br/>
                  <small>₱${v.price || product.price} | Stock: ${v.stock || 0}</small>
                </button>
              `).join('')}
            </div>

            <div class="cart-controls">
              <label>Quantity:</label>
              <div class="qty-control" role="group" aria-label="Quantity">
                <button type="button" id="qty-minus" class="qty-btn" aria-label="Decrease quantity">−</button>
                <span id="qty-value" class="qty-value" aria-live="polite">1</span>
                <button type="button" id="qty-plus" class="qty-btn" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="button-group">
              <button class="btn-primary" id="add-to-cart-btn">Add to Cart</button>
              <button class="btn-secondary" id="buy-now-btn">Buy Now</button>
            </div>
            <p id="cart-msg" style="margin-top: 12px; display:none; color: #28a745;"></p>

          </div>

        </div>
      </section>
    `;

    // Variant selection
    const variantBtns = root.querySelectorAll('.variant-option');
    variantBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        variantBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedVariant = variants[idx];
        // Update price display
        const priceEl = root.querySelector('.product-price');
        if (priceEl) priceEl.textContent = `₱ ${selectedVariant.price || product.price}`;
      });
    });

    // Add to cart
    const addBtn = root.querySelector('#add-to-cart-btn');
    const qtyValueEl = root.querySelector('#qty-value');
    const qtyMinus = root.querySelector('#qty-minus');
    const qtyPlus = root.querySelector('#qty-plus');
    const cartMsg = root.querySelector('#cart-msg');

    let qty = 1;
    const setQty = (next) => {
      const n = Number(next);
      if (!Number.isFinite(n)) return;
      qty = Math.max(1, Math.min(999, Math.floor(n)));
      if (qtyValueEl) qtyValueEl.textContent = String(qty);
    };
    qtyMinus?.addEventListener('click', () => setQty(qty - 1));
    qtyPlus?.addEventListener('click', () => setQty(qty + 1));

    addBtn?.addEventListener('click', async () => {
      const variant = selectedVariant || variants[0];

      if (!variant) {
        alert('Please select a variant');
        return;
      }

      const variantId = variant.product_variant_id || variant.id || variant.variant_id;
      if (!variantId) {
        alert('Invalid variant selected');
        return;
      }

      try {
        // Disable button and show loading state
        addBtn.disabled = true;
        addBtn.textContent = 'Adding...';
        
        const result = await addToCart(variantId, qty);
        if (result.success) {
          // Show success toast notification
          showToastNotification('Added to Cart!', `${product.name} (${variant.name || variant.variant_values || 'Default'}) x${qty}`);
          
          // Update cart message as fallback
          if (cartMsg) {
            cartMsg.textContent = '✓ Added to cart successfully!';
            cartMsg.style.display = 'block';
            setTimeout(() => {
              cartMsg.style.display = 'none';
            }, 3000);
          }
        } else {
          alert('Failed to add to cart: ' + result.message);
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        alert('Error adding to cart: ' + error.message);
      } finally {
        // Re-enable button
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Cart';
      }
    });

    // Buy now - add to cart and navigate directly to checkout
    const buyBtn = root.querySelector('#buy-now-btn');
    buyBtn?.addEventListener('click', async () => {
      const variant = selectedVariant || variants[0];

      if (!variant) {
        alert('Please select a variant');
        return;
      }

      const variantId = variant.product_variant_id || variant.id || variant.variant_id;
      if (!variantId) {
        alert('Invalid variant selected');
        return;
      }

      try {
        // Disable button and show loading state
        buyBtn.disabled = true;
        buyBtn.textContent = 'Processing...';
        
        // Add to cart first
        const result = await addToCart(variantId, qty);
        if (result.success) {
          // Show success toast
          showToastNotification('Processing Order', 'Redirecting to checkout...');
          
          // Get cart items to set up checkout
          const { getCart } = await import('../cart/cart.js');
          const cartItems = await getCart();
          
          // Find the item we just added
          const addedItem = cartItems.find(item => item.variant_id === parseInt(variantId));
          
          if (addedItem) {
            // Set up checkout session storage (same as cart modal does)
            sessionStorage.setItem('checkoutStep', '1'); // Start at shipping step
            sessionStorage.setItem('checkoutItems', JSON.stringify([addedItem]));
            
            // Calculate summary
            const subtotal = parseFloat(addedItem.price || 0) * addedItem.quantity;
            const shippingFee = 0; // Will be calculated in checkout
            sessionStorage.setItem('checkoutSummary', JSON.stringify({
              subtotal: subtotal,
              shipping_fee: shippingFee,
              total: subtotal + shippingFee
            }));
            
            // Navigate to checkout page
            window.location.href = '/checkout';
          } else {
            alert('Item added to cart but could not proceed to checkout. Please try again.');
          }
        } else {
          alert('Failed to add to cart: ' + result.message);
        }
      } catch (error) {
        console.error('Buy now error:', error);
        alert('Error processing order: ' + error.message);
      } finally {
        // Re-enable button (in case navigation fails)
        setTimeout(() => {
          buyBtn.disabled = false;
          buyBtn.textContent = 'Buy Now';
        }, 2000);
      }
    });

    // Back button
    const backBtn = root.querySelector('#back-to-shop');
    backBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      history.back();
    });

  } catch (err) {
    console.error('Error loading product detail', err);
    root.innerHTML = `<p class="error">${err.message || 'Error loading product'}</p>`;
  }
}
