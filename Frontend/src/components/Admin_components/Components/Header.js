import '../../../styles/Admin_styles//Header.css';

export default function Header(root) {
  root.className = 'admin-header';

  root.innerHTML = `
    <div class="header-left">
      <h1 id="pageTitle">Dashboard</h1>
    </div>

    <div class="header-right">
    
      <div class="search-box">
        <input type="text" placeholder="Search..." id="searchInput">
        <button class="search-btn">🔍</button>
      </div>

      <div class="notif-admin">
        <button class="notif_button">Notification</button>

      </div>

      <div class="admin-profile">
        <button class="admin_button">
          <span class="icon-admin">👤</span>
          <span class="admin-name">Admin</span>
        </button>  
      </div>
    </div>

    


  `;


  root.querySelector('#searchInput').addEventListener('input', (e) => {
    console.log('[Header] Searching:', e.target.value);
  });
}
