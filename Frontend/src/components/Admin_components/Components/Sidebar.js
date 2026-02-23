import '../../../styles/Admin_styles/Sidebar.css';

export default function Sidebar(root) {
  root.className = 'admin-sidebar';

  root.innerHTML = `
    <div class="sidebar-header">
      <h2>BINI Admin</h2>
      <button class="sidebar-toggle" id="sidebarToggle">☰</button>
    </div>

    <nav class="sidebar-nav">
      <a href="/dashboard" class="nav-link active" data-link>
        <span class="nav-icon">📊</span>
        <span class="nav-text">Dashboard</span>
      </a>
      <a href="/users" class="nav-link" data-link>
        <span class="nav-icon">👥</span>
        <span class="nav-text">Users</span>
      </a>
      <a href="/groups" class="nav-link" data-link>
        <span class="nav-icon">👫</span>
        <span class="nav-text">Groups</span>
      </a>
      <a href="/subadmin/community" class="nav-link" data-link>
        <span class="nav-icon">💬</span>
        <span class="nav-text">Community</span>
      </a>
      <a href="/marketplace" class="nav-link" data-link>
        <span class="nav-icon">🛍️</span>
        <span class="nav-text">Marketplace</span>
      </a>
      <a href="/orders" class="nav-link" data-link>
        <span class="nav-icon">📦</span>
        <span class="nav-text">Orders</span>
      </a>
      <a href="/payments" class="nav-link" data-link>
        <span class="nav-icon">💳</span>
        <span class="nav-text">Payments</span>
      </a>
      <a href="/messaging" class="nav-link" data-link>
        <span class="nav-icon">✉️</span>
        <span class="nav-text">Messaging</span>
      </a>
      <a href="/threads" class="nav-link" data-link>
        <span class="nav-icon">🧵</span>
        <span class="nav-text">Threads</span>
      </a>
      <a href="/analytics" class="nav-link" data-link>
        <span class="nav-icon">📈</span>
        <span class="nav-text">Analytics</span>
      </a>
      <a href="/subadmin/reports" class="nav-link" data-link>
        <span class="nav-icon">📋</span>
        <span class="nav-text">Reports</span>
      </a>
      <a href="/settings" class="nav-link" data-link>
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">Settings</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" id="logoutBtn">Logout</button>
    </div>
  `;

  root.querySelector('#sidebarToggle').addEventListener('click', () => {
    root.classList.toggle('expanded');
  });

  const links = root.querySelectorAll('.nav-link');

  function setActiveLink(pathname) {
    links.forEach(link => {
      const linkPath = new URL(link.href, window.location.origin).pathname;
      link.classList.toggle('active', linkPath === pathname);
    });
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      const path = new URL(link.href, window.location.origin).pathname;
      setActiveLink(path);
    });
  });

  setActiveLink(window.location.pathname);

  root.querySelector('#logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = 'login.html';
    }
  });
}
