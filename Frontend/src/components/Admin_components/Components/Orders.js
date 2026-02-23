import '../../../styles/Admin_styles/Orders.css';

export default function createOrders() {
  const section = document.createElement('section');
  section.id = 'orders';
  section.className = 'content-section active';

  section.innerHTML = `
    <div class="section-header">
      <h2>Order Management</h2>
    </div>

    <div class="filters">
      <input 
        type="text" 
        placeholder="Search orders..." 
        class="filter-input" 
        id="orderSearch"
      >
      <select class="filter-select" id="orderStatusFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input type="date" class="filter-date" id="orderDateFilter">
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="ordersTableBody"></tbody>
      </table>
    </div>
  `;


  const mockOrders = [
    { id: "#ORD-001", customer: "Miko", amount: "₱2,499", status: "Processing", date: "2024-01-20" },
    { id: "#ORD-002", customer: "Aaron", amount: "₱1,299", status: "Shipped", date: "2024-01-19" },
    { id: "#ORD-003", customer: "Jamin", amount: "₱3,599", status: "Delivered", date: "2024-01-18" },
  ];

  function loadOrders() {
    const tbody = section.querySelector("#ordersTableBody");
    if (!tbody) return;

    tbody.innerHTML = mockOrders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.amount}</td>
        <td>
          <span class="badge badge-${o.status.toLowerCase()}">
            ${o.status}
          </span>
        </td>
        <td>${o.date}</td>
        <td>
          <button class="btn-icon" title="View">👁️</button>
          <button class="btn-icon" title="Edit">✏️</button>
          <button class="btn-icon btn-danger" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join("");
  }

  function filterOrders() {
    const q = section.querySelector("#orderSearch").value.toLowerCase();
    const status = section.querySelector("#orderStatusFilter").value.toLowerCase();
    const date = section.querySelector("#orderDateFilter").value;

    section.querySelectorAll("#ordersTableBody tr").forEach(row => {
      const id = row.cells[0].textContent.toLowerCase();
      const name = row.cells[1].textContent.toLowerCase();
      const st = row.cells[3].textContent.toLowerCase();
      const rowDate = row.cells[4].textContent;

      const matchText = id.includes(q) || name.includes(q);
      const matchStatus = !status || st.includes(status);
      const matchDate = !date || rowDate === date;

      row.style.display =
        matchText && matchStatus && matchDate ? "" : "none";
    });
  }

  function setupOrderFilters() {
    const search = section.querySelector("#orderSearch");
    const status = section.querySelector("#orderStatusFilter");
    const date = section.querySelector("#orderDateFilter");

    search.addEventListener("input", filterOrders);
    status.addEventListener("change", filterOrders);
    date.addEventListener("change", filterOrders);
  }


  function initOrders() {
    setupOrderFilters();
    loadOrders();
  }

  initOrders();

  return section;
}
