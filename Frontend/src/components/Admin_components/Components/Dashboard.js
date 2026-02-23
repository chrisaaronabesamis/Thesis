import { api } from '../../../services/ecommerce_services/api.js';

export default function Dashboard() {
  const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000/v1/admin';
  const section = document.createElement('section');
  section.id = 'dashboard';
  section.className = 'content-section active';

  // Current selected community
  let selectedCommunity = 'all';
  let currentPage = 1;
  const rowsPerPage = 5;

  // Store fetched data
  let communityStats = {};
  let revenueData = {};

  // -----------------------------
  // 🔹 Helper Functions
  // -----------------------------
  
  async function fetchCommunityStats(communityKey) {
    try {
      const res = await api(`${ADMIN_API_BASE}/dashboard/stats?community=${encodeURIComponent(communityKey)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      communityStats = data;  // { all: {...}, music: {...}, gaming: {...}, ... }
    } catch (err) {
      console.error('Error fetching community stats:', err);
    }
  }

  async function fetchRevenueData(communityKey) {
    try {
      const res = await api(`${ADMIN_API_BASE}/dashboard/community?community=${encodeURIComponent(communityKey)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      revenueData[communityKey] = Array.isArray(data)
        ? data.map((row) => ({
            date: row.date,
            time: row.time || '-',
            revenue: Number(row.revenue ?? row.total_amount ?? 0),
          }))
        : [];
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      revenueData[communityKey] = [];
    }
  }

  function updateStatCards(communityKey) {
    const stats = communityStats[communityKey] || {
      revenue: 0, orders: 0, posts: 0, pendingModeration: 0, lowStock: 0, newOrdersToday: 0
    };

    const ids = ['totalRevenue','totalOrders','totalPosts','pendingModeration','lowStock','newOrdersToday'];
    const keys = ['revenue','orders','posts','pendingModeration','lowStock','newOrdersToday'];

    ids.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = id === 'totalRevenue' ? `₱${stats[keys[idx]].toLocaleString()}` : stats[keys[idx]];
      }
    });
  }

  function renderTableRows(page) {
    const currentData = revenueData[selectedCommunity] || [];
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return currentData.slice(start, end).map(row =>
      `<tr>
        <td style="padding:8px;">${row.date}</td>
        <td style="padding:8px; text-align:center;">${row.time}</td>
        <td style="padding:8px; text-align:right;">₱${row.revenue.toLocaleString()}</td>
      </tr>`
    ).join('');
  }

  function renderPagination(pageCount, currentPage) {
    let buttons = '';
    for (let i = 1; i <= pageCount; i++) {
      buttons += `<button class="revenue-pagination-btn" data-page="${i}" style="
        margin:0 4px; padding:4px 10px; border-radius:4px; border:1px solid #e5e7eb;
        background:${i===currentPage?'#ec4899':'#fff'}; color:${i===currentPage?'#fff':'#333'}; cursor:pointer;">
        ${i}</button>`;
    }
    return `<div style="text-align:center; margin-top:12px;">${buttons}</div>`;
  }

  function updateTableAndPagination() {
    const currentData = revenueData[selectedCommunity] || [];
    const pageCount = Math.ceil(currentData.length / rowsPerPage);
    const tbody = section.querySelector('tbody');
    const paginationDiv = section.querySelector('.pagination-container');

    if (tbody) tbody.innerHTML = renderTableRows(currentPage);
    if (paginationDiv) paginationDiv.innerHTML = renderPagination(pageCount, currentPage);
  }

  async function initCommunityData(communityKey) {
    // Clear old rows immediately when switching community
    revenueData[communityKey] = [];
    updateTableAndPagination();

    await fetchCommunityStats(communityKey);
    await fetchRevenueData(communityKey);
    updateStatCards(communityKey);
    updateTableAndPagination();
  }

  // -----------------------------
  // 🔹 Render Dashboard HTML
  // -----------------------------
  function renderDashboardHTML() {
    return `
      <div class="dashboard-wrapper">
        <div class="community-filter" style="margin-bottom:24px;">
          <label for="communitySelect" style="display:block; margin-bottom:8px; font-weight:600; color:#333;">Select Community</label>
          <select id="communitySelect" style="padding:10px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:14px; cursor:pointer; width:100%; max-width:300px;">
            <option value="all">All Communities</option>
            <option value="bini">Bini</option>
            <option value="sb19">sb19</option>
        
          </select>
        </div>

        <div class="dashboard-grid" style="flex-wrap: wrap; gap: 18px;">
          ${['Revenue','Total Orders','Total Posts','Pending Moderation','Low Stock','New Orders Today'].map((title, idx) => `
            <div class="stat-card">
              <div class="stat-icon"></div>
              <div class="stat-info">
                <h3>${title}</h3>
                <p class="stat-number" id="${['totalRevenue','totalOrders','totalPosts','pendingModeration','lowStock','newOrdersToday'][idx]}">0</p>
                ${title==='Revenue'?'<span class="stat-change positive">+0% this month</span>':''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="dashboard-middle" style="margin:40px 0 0 0;">
          <div class="table-container" style="background:#fff; border-radius:12px; box-shadow:0 2px 8px #0001; padding:24px; margin:0 auto;">
            <h3 style="color:#333; margin-bottom:18px;">Revenue Table (Daily)</h3>
            <table style="width:100%; border-collapse: collapse;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:left;">Date</th>
                  <th style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:center;">Time</th>
                  <th style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:right;">Revenue</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
            <div class="pagination-container"></div>
          </div>
        </div>
      </div>
    `;
  }

  section.innerHTML = renderDashboardHTML();

  // -----------------------------
  // 🔹 Event Listeners
  // -----------------------------
  section.addEventListener('change', function(e) {
    if (e.target.id === 'communitySelect') {
      selectedCommunity = e.target.value;
      currentPage = 1;
      initCommunityData(selectedCommunity);
    }
  });

  section.addEventListener('click', function(e) {
    if (e.target.classList.contains('revenue-pagination-btn')) {
      const page = parseInt(e.target.getAttribute('data-page'));
      if (!isNaN(page)) {
        currentPage = page;
        updateTableAndPagination();
      }
    }
  });

  // -----------------------------
  // 🔹 Initialize Dashboard
  // -----------------------------
  (async () => {
    await initCommunityData(selectedCommunity);
  })();

  return section;
}
