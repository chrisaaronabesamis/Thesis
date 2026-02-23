import { api } from '../config.js';
import { authHeaders } from '../auth/auth.js';

// Fetch product details + variants from backend and return { product, variants }
export async function fetchProductDetails(productId) {
  console.log("Fetching product details for ID:", productId);
  const headers = Object.assign({ 'Content-Type': 'application/json' }, authHeaders());
  const resp = await fetch(api(`/shop/getProductDetails/${productId}`), { method: 'GET', headers });
  if (!resp.ok) {
    const err = await resp.json().catch(()=>({ message: 'unknown' }));
    throw new Error(err.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const product = data?.data?.product || data?.product || null;
  const variants = data?.data?.variants || data?.variants || [];
  return { product, variants };
}

// provide a default export for compatibility with components importing default
export default fetchProductDetails;


