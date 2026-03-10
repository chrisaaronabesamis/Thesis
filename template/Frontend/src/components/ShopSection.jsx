import React, { useState, useMemo } from 'react';
import './ShopSection.css';

export default function ShopSection(props) {
  const {
    view = 'catalog',
    collections = [],
    products = [],
    cartItems: externalCartItems = [],
    onSelectCollection,
    onSelectProduct,
    onAddToCart,
    onBuyNow,
    onPaymentMethodChange,
    onPlaceCodOrder,
  } = props;

  const [localCart, setLocalCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bini_cart') || '[]'); } catch { return []; }
  });
  const cartItems = Array.isArray(localCart) ? localCart : [];

  const [search, setSearch] = useState('');

  function persistCart(next) {
    try {
      setLocalCart(next);
      localStorage.setItem('bini_cart', JSON.stringify(next));
    } catch (e) {
      console.warn('persistCart failed', e);
    }
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  async function addToCart(productId) {
    // Prefer app-level handler (which may call backend) so cart is consistent
    if (typeof onAddToCart === 'function') {
      try {
        await onAddToCart(productId);
      } catch (err) {
        console.warn('onAddToCart failed', err);
      }
    } else {
      const existing = (localCart || []).slice();
      const idx = existing.findIndex((it) => String(it.id) === String(productId));
      if (idx > -1) {
        existing[idx].quantity = Number(existing[idx].quantity || 0) + 1;
        persistCart(existing);
      } else {
        const p = (products || []).find((x) => String(x.id) === String(productId)) || { id: productId, name: `Product ${productId}`, price: 0 };
        persistCart(
          existing.concat([
            { id: p.id || productId, name: p.name || p.title || `Product ${productId}`, price: Number(p.price || 0), quantity: 1 },
          ]),
        );
      }
    }
    // Open the right-side cart drawer to show feedback and let the user proceed
    setDrawerOpen(true);
  }

  async function buyNow(productId) {
    if (typeof onBuyNow === 'function') {
      try {
        await onBuyNow(productId);
        // app-level onBuyNow should navigate to checkout; ensure COD is set
        if (typeof onPaymentMethodChange === 'function') onPaymentMethodChange('COD');
        return;
      } catch (err) {
        console.warn('onBuyNow failed', err);
      }
    }
    // fallback: persist locally and go to checkout
    persistCart([{ id: productId, name: `Product ${productId}`, price: 0, quantity: 1 }]);
    if (typeof onPaymentMethodChange === 'function') onPaymentMethodChange('COD');
    window.location.hash = '/shop?view=checkout';
  }

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return products || [];
    return (products || []).filter((p) => (((p.name || '') + ' ' + (p.description || '')).toLowerCase().indexOf(q) !== -1));
  }, [products, search]);

  const activeView = String(view || 'catalog').toLowerCase();
  const visibleCartItems = Array.isArray(externalCartItems) && externalCartItems.length ? externalCartItems : cartItems;
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const categories = useMemo(() => {
    const set = new Set(['All']);
    (products || []).forEach((p) => {
      const cats = p.categories || (p.category ? [p.category] : []);
      (cats || []).forEach((c) => set.add(String(c || '')));
    });
    return [...set];
  }, [products]);

  const displayed = useMemo(() => {
    let list = filtered || [];
    if (activeCategory && activeCategory !== 'All') {
      list = list.filter((p) => ((p.categories || []).map(String).includes(activeCategory) || String(p.category) === activeCategory));
    }
    if (sortBy === 'price_asc') list = list.slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === 'price_desc') list = list.slice().sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return list;
  }, [filtered, activeCategory, sortBy]);

  return (
    <section id="shop" className="panel shop-section">
      <div className="shop-head"><h2>Bini Shop</h2></div>

      {activeView === 'catalog' && (
        <div>
          <div className="shop-hero" role="banner">
            <div className="shop-hero-inner">
              <h1>Welcome to Bini Shop</h1>
              <p className="muted">Discover exclusive merchandise — shirts, accessories, and limited drops supporting the community.</p>
            </div>
          </div>

          <h3 className="collections-title">Collections</h3>
          <div className="collections-grid">
            {collections.map((c) => (
              <button key={c.id} className="collection-card" onClick={() => onSelectCollection && onSelectCollection(c.id)} aria-label={`Open ${c.name}`}>
                {c.image ? <img src={c.image} alt={c.name} /> : <div className="image-fallback" />}
                <div className="collection-name">{c.name}</div>
              </button>
            ))}
          </div>

          <section className="products-panel">
            <h3 className="products-title">Products</h3>
            <div className="products-controls">
              <div className="filter-pills" role="tablist">
                {categories.map((cat) => (
                  <button key={cat} className={`pill ${cat === activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                ))}
              </div>
              <div className="sort-block">
                <label className="muted" style={{ marginRight: 8 }}>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="product-grid">
              {displayed.map((p) => (
                <article key={p.id} className="product-card">
                  {p.image ? <img src={p.image} alt={p.name} /> : <div className="image-fallback" />}
                  <div className="card-body">
                    <h3>{p.name}</h3>
                    <p className="muted price">PHP {Number(p.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => addToCart(p.id)} className="soft-btn">Add to Cart</button>
                    <button onClick={() => buyNow(p.id)} className="soft-btn primary">Buy Now</button>
                    <a href={`#/shop?view=product&product=${encodeURIComponent(p.id)}`} onClick={() => onSelectProduct && onSelectProduct(p.id)} className="soft-btn">Details</a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeView === 'cart' && (
        <div>
          <h3>Cart</h3>
          {(visibleCartItems || []).map((it) => (
            <div key={it.id}>{it.name} x {it.quantity}</div>
          ))}
        </div>
      )}

      {activeView === 'checkout' && (
        <div>
          <h3>Checkout</h3>
          <p>Subtotal: PHP {(visibleCartItems || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0).toLocaleString()}</p>
          <button onClick={onPlaceCodOrder}>Place COD Order</button>
        </div>
      )}

      {/* Right-side drawer for quick cart preview */}
      <div className={`cart-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="cart-drawer-header">
          <h4>Your Cart</h4>
          <button type="button" className="close-btn" onClick={() => setDrawerOpen(false)}>Close</button>
        </div>
        <div className="cart-drawer-body">
          {(visibleCartItems || []).length === 0 ? (
            <p className="muted">Your cart is empty.</p>
          ) : (
            (visibleCartItems || []).map((it) => (
              <div key={it.id} className="cart-row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>{it.name}</div>
                  <div>× {it.quantity}</div>
                </div>
                <div style={{ marginTop: 8 }}>PHP {(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <div className="cart-drawer-footer">
          <a className="soft-btn" href="#/shop?view=cart" onClick={() => setDrawerOpen(false)}>View full cart</a>
          <a className="soft-btn primary" href="#/shop?view=checkout" onClick={() => { if (typeof onPaymentMethodChange === 'function') onPaymentMethodChange('COD'); setDrawerOpen(false); }}>Checkout (COD)</a>
        </div>
      </aside>
    </section>
  );
}
