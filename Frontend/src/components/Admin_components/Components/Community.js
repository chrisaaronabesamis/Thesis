import '../../../styles/Admin_styles/Community.css';

export default function Community() {
  const section = document.createElement('section');
  section.id = 'community';
  section.className = 'content-section active';

  section.innerHTML = `
    <div class="cm-section">
      <div class="cm-header">
        <h2>Active Sites / Communities</h2>
        <button class="cm-btn-create" id="addSiteBtn">+ Add Site</button>
      </div>

      <div class="cm-filters">
        <input 
          type="text" 
          placeholder="Search sites..." 
          class="cm-search" 
          id="siteSearch"
        >
        <select class="cm-select" id="siteStatusFilter">
          <option value="">All Sites</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="cm-sites-grid" id="sitesContainer"></div>

      <div class="cm-pagination">
        <button class="cm-btn-page" id="prevBtn">← Previous</button>
        <span class="cm-page-info"><span id="currentPage">1</span> / <span id="totalPages">1</span></span>
        <button class="cm-btn-page" id="nextBtn">Next →</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="cm-modal" id="editModal" style="display: none;">
      <div class="cm-modal-content">
        <div class="cm-modal-header">
          <h3>Edit Site</h3>
          <button class="cm-modal-close" id="closeModal">&times;</button>
        </div>

        <form class="cm-modal-form" id="editForm">
          <div class="form-group">
            <label>Site Name</label>
            <input type="text" id="siteName" required>
          </div>

          <div class="form-group">
            <label>Community Type</label>
            <select id="communityType" required>
              <option value="">Select Type</option>
              <option value="bini">Bini</option>
              <option value="ecommerce">E-commerce</option>
              <option value="general">General</option>
            </select>
          </div>

          <div class="form-group">
            <label>Database Name</label>
            <input type="text" id="dbName" required>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select id="status" required>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="cm-modal-actions">
            <button type="submit" class="cm-btn cm-btn-save">Save Changes</button>
            <button type="button" class="cm-btn cm-btn-cancel" id="cancelBtn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const mockSites = [
    {
      id: 1,
      name: 'BINI Community',
      type: 'bini',
      url: 'http://localhost:3001',
      db_name: 'bini_core_db',
      status: 'active',
      users: 1250,
      posts: 4523
    },
    {
      id: 2,
      name: 'Shop Hub',
      type: 'ecommerce',
      url: 'http://localhost:3002',
      db_name: 'ecommerce_db',
      status: 'active',
      users: 856,
      posts: 2341
    },
    {
      id: 3,
      name: 'Community Forum',
      type: 'general',
      url: 'http://localhost:3003',
      db_name: 'forum_db',
      status: 'inactive',
      users: 456,
      posts: 1023
    }
  ];

  let sites = [...mockSites];
  let editingId = null;
  let currentPage = 1;
  const itemsPerPage = 3;

  function loadSites() {
    const container = section.querySelector('#sitesContainer');
    const totalPages = Math.ceil(sites.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSites = sites.slice(startIndex, endIndex);

    container.innerHTML = paginatedSites.map(site => `
      <div class="cm-site-card" data-site-id="${site.id}">
        <div class="cm-card-header">
          <span class="cm-badge cm-badge-${site.status}">
            ${site.status.toUpperCase()}
          </span>
        </div>

        <div class="cm-card-body">
          <h3 class="cm-card-title">${site.name}</h3>
          
          <div class="cm-card-meta">
            <div class="cm-meta-item">
              <span class="cm-meta-label">Type</span>
              <span class="cm-meta-value">${site.type.charAt(0).toUpperCase() + site.type.slice(1)}</span>
            </div>
            <div class="cm-meta-item">
              <span class="cm-meta-label">Database</span>
              <span class="cm-meta-value">${site.db_name}</span>
            </div>
          </div>

          <div class="cm-card-stats">
            <div class="cm-stat">
              <div>
                <span class="cm-stat-label">Users</span>
                <span class="cm-stat-value">${site.users}</span>
              </div>
            </div>
            <div class="cm-stat">
              <div>
                <span class="cm-stat-label">Posts</span>
                <span class="cm-stat-value">${site.posts}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="cm-card-actions">
          <a href="${site.url}" target="_blank" class="cm-action-btn cm-btn-visit">
            Visit
          </a>
          <button class="cm-action-btn cm-btn-edit" data-edit="${site.id}">Edit</button>
          ${site.status === 'active' 
            ? `<button class="cm-action-btn cm-btn-deactivate" data-deactivate="${site.id}">Deactivate</button>`
            : `<button class="cm-action-btn cm-btn-reactivate" data-reactivate="${site.id}">Reactivate</button>`
          }
        </div>
      </div>
    `).join('');

    // Update pagination info
    section.querySelector('#currentPage').textContent = currentPage;
    section.querySelector('#totalPages').textContent = totalPages;
    section.querySelector('#prevBtn').disabled = currentPage === 1;
    section.querySelector('#nextBtn').disabled = currentPage === totalPages;
  }

  function openEditModal(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    editingId = siteId;
    section.querySelector('#siteName').value = site.name;
    section.querySelector('#communityType').value = site.type;
    section.querySelector('#dbName').value = site.db_name;
    section.querySelector('#status').value = site.status;

    section.querySelector('#editModal').style.display = 'flex';
  }

  function closeEditModal() {
    section.querySelector('#editModal').style.display = 'none';
    editingId = null;
  }

  function saveSite() {
    if (!editingId) return;

    const siteIndex = sites.findIndex(s => s.id === editingId);
    if (siteIndex === -1) return;

    sites[siteIndex] = {
      ...sites[siteIndex],
      name: section.querySelector('#siteName').value,
      type: section.querySelector('#communityType').value,
      db_name: section.querySelector('#dbName').value,
      status: section.querySelector('#status').value
    };

    currentPage = 1;
    loadSites();
    attachSiteEventListeners();
    closeEditModal();
    console.log('Site saved:', sites[siteIndex]);
  }

  function toggleSiteStatus(siteId, newStatus) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    site.status = newStatus;
    currentPage = 1;
    loadSites();
    attachSiteEventListeners();
    console.log(`Site ${siteId} ${newStatus}`);
  }

  function filterSites() {
    const search = section.querySelector('#siteSearch').value.toLowerCase();
    const status = section.querySelector('#siteStatusFilter').value;

    const filtered = mockSites.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(search) || 
                           site.type.toLowerCase().includes(search);
      const matchesStatus = !status || site.status === status;
      return matchesSearch && matchesStatus;
    });

    sites = filtered;
    currentPage = 1;
    loadSites();
    attachSiteEventListeners();
  }

  function attachSiteEventListeners() {
    // Edit buttons
    section.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const siteId = parseInt(e.target.dataset.edit);
        openEditModal(siteId);
      });
    });

    // Deactivate buttons
    section.querySelectorAll('[data-deactivate]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const siteId = parseInt(e.target.dataset.deactivate);
        if (confirm('Are you sure you want to deactivate this site?')) {
          toggleSiteStatus(siteId, 'inactive');
        }
      });
    });

    // Reactivate buttons
    section.querySelectorAll('[data-reactivate]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const siteId = parseInt(e.target.dataset.reactivate);
        toggleSiteStatus(siteId, 'active');
      });
    });
  }

  function setupEventListeners() {
    section.querySelector('#siteSearch').addEventListener('input', filterSites);
    section.querySelector('#siteStatusFilter').addEventListener('change', filterSites);

    section.querySelector('#addSiteBtn').addEventListener('click', () => {
      // Navigate to Generate Website page with proper hash routing
      window.location.href = window.location.origin + '/subadmin/generate-website';
    });

    section.querySelector('#editForm').addEventListener('submit', (e) => {
      e.preventDefault();
      saveSite();
    });

    section.querySelector('#closeModal').addEventListener('click', closeEditModal);
    section.querySelector('#cancelBtn').addEventListener('click', closeEditModal);

    section.querySelector('#editModal').addEventListener('click', (e) => {
      if (e.target.id === 'editModal') closeEditModal();
    });

    // Pagination buttons
    section.querySelector('#prevBtn').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadSites();
        attachSiteEventListeners();
      }
    });

    section.querySelector('#nextBtn').addEventListener('click', () => {
      const totalPages = Math.ceil(sites.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        loadSites();
        attachSiteEventListeners();
      }
    });
  }

  loadSites();
  attachSiteEventListeners();
  setupEventListeners();

  return section;
}
