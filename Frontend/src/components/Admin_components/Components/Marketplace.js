import '../../../styles/Admin_styles/Marketplace.css';

export default function createMarketplace() {
  const section = document.createElement('section');
  section.id = 'marketplace';
  section.className = 'content-section active marketplace';


  section.innerHTML = `
    <div class="section-header">
      <h2>Marketplace Management</h2>
      <button class="btn btn-primary" id="addProductBtn">+ Add Product</button>
    </div>

    <div class="filters">
      <input type="text" placeholder="Search products..." class="filter-input" id="productSearch">
      <select class="filter-select" id="categoryFilter">
        <option value="">All Categories</option>
        <option value="merchandise">Merchandise</option>
        <option value="albums">Albums</option>
        <option value="tickets">Tickets</option>
        <option value="digital">Digital</option>
      </select>
    </div>

    <div class="products-grid" id="productsGrid"></div>
  `;

  const mockProducts = [
    {
      id: "#PRD001",
      name: "BINI T-Shirt",
      category: "Merchandise",
      price: "₱599",
      stock: 45,
      sold: 234,
      image: "/placeholder.svg?height=200&width=200"
    },
    {
      id: "#PRD002",
      name: "BINI Album Vol. 1",
      category: "Albums",
      price: "₱899",
      stock: 20,
      sold: 120,
      image: "/placeholder.svg?height=200&width=200"
    },
    {
      id: "#PRD003",
      name: "BINI Concert Ticket",
      category: "Tickets",
      price: "₱2,499",
      stock: 0,
      sold: 300,
      image: "/placeholder.svg?height=200&width=200"
    }
  ];

  function loadProducts() {
    const grid = section.querySelector('#productsGrid');
    grid.innerHTML = mockProducts.map(p => `
      <div class="product-card" data-product-id="${p.id}">
        <img src="${p.image}" alt="Product" class="product-image">
        <div class="product-info">
          <h4>${p.name}</h4>
          <p class="product-category">${p.category}</p>
          <p class="product-price">${p.price}</p>
          <div class="product-stats">
            <span>Stock: ${p.stock}</span>
            <span>Sold: ${p.sold}</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-sm">Edit</button>
            <button class="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function filterProducts() {
    const q = section.querySelector("#productSearch").value.toLowerCase();
    const category = section.querySelector("#categoryFilter").value.toLowerCase();

    section.querySelectorAll(".product-card").forEach(card => {
      const name = card.querySelector("h4").textContent.toLowerCase();
      const cat = card.querySelector(".product-category").textContent.toLowerCase();

      const matchText = name.includes(q);
      const matchCategory = !category || cat.includes(category);

      card.style.display = matchText && matchCategory ? "" : "none";
    });
  }

  function setupProductFilters() {
    section.querySelector("#productSearch").addEventListener("input", filterProducts);
    section.querySelector("#categoryFilter").addEventListener("change", filterProducts);
  }

  function setupProductActions() {
    section.addEventListener("click", e => {
      const card = e.target.closest(".product-card");
      const productId = card?.dataset.productId;
      const action = e.target.textContent.trim().toLowerCase();

      if (action === "edit") {
        alert(`Editing product ${productId}`);
      } else if (action === "delete") {
        alert(`Deleting product ${productId}`);
      }
    });
  }

  function initMarketplace() {
    loadProducts();
    setupProductFilters();
    setupProductActions();
  }

  initMarketplace();
  return section;
}
