import { api } from '../../../services/ecommerce_services/api.js';

export default function Threads() {
  console.log('🔧 Threads component is being initialized...');
  
  const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000';
  const section = document.createElement('section');
  section.id = 'threads';
  section.className = 'content-section active';

  console.log('📝 Creating threads section element...');

  // State management
  let threads = [];
  let sites = [];
  let currentThread = null;
  let isEditMode = false;
  let selectedSite = 'all';
  let currentPage = 1;
  const rowsPerPage = 10;

  // -----------------------------
  // 🔹 Helper Functions
  // -----------------------------

  async function fetchThreads() {
    try {
      const url = selectedSite === 'all' 
        ? `${ADMIN_API_BASE}/v1/threads`
        : `${ADMIN_API_BASE}/v1/threads?site_id=${selectedSite}`;
      
      console.log('📡 Fetching threads from:', url);
      const res = await api(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      threads = data.data || [];
      console.log('✅ Threads fetched:', threads);
      renderThreadsList();
    } catch (err) {
      console.error('Error fetching threads:', err);
      showError('Failed to fetch threads');
    }
  }

  async function fetchSites() {
    try {
      const res = await api(`${ADMIN_API_BASE}/v1/admin/sites`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      sites = data.data || [];
      console.log('✅ Sites fetched:', sites);
      renderSiteFilter();
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  }

  async function createThread(threadData) {
    try {
      const res = await api(`${ADMIN_API_BASE}/v1/admin/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadData)
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.success) {
        showSuccess('Thread created successfully!');
        closeModal();
        fetchThreads();
      } else {
        showError(data.message || 'Failed to create thread');
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      showError('Failed to create thread');
    }
  }

  async function updateThread(id, threadData) {
    try {
      const res = await api(`${ADMIN_API_BASE}/v1/admin/threads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadData)
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.success) {
        showSuccess('Thread updated successfully!');
        closeModal();
        fetchThreads();
      } else {
        showError(data.message || 'Failed to update thread');
      }
    } catch (err) {
      console.error('Error updating thread:', err);
      showError('Failed to update thread');
    }
  }

  async function deleteThread(id) {
    if (!confirm('Are you sure you want to delete this thread?')) return;
    
    try {
      const res = await api(`${ADMIN_API_BASE}/v1/admin/threads/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.success) {
        showSuccess('Thread deleted successfully!');
        fetchThreads();
      } else {
        showError(data.message || 'Failed to delete thread');
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      showError('Failed to delete thread');
    }
  }

  // -----------------------------
  // 🔹 Rendering Functions
  // -----------------------------

  function renderSiteFilter() {
    const filterContainer = section.querySelector('.site-filter');
    if (!filterContainer) return;

    filterContainer.innerHTML = `
      <select id="siteFilter" class="site-select">
        <option value="all">All Sites</option>
        ${sites.map(site => `
          <option value="${site.id}">${site.site_name}</option>
        `).join('')}
      </select>
    `;

    filterContainer.querySelector('#siteFilter').addEventListener('change', (e) => {
      selectedSite = e.target.value;
      currentPage = 1;
      fetchThreads();
    });
  }

  function renderThreadsList() {
    const tbody = section.querySelector('.threads-table tbody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedThreads = threads.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedThreads.map(thread => `
      <tr>
        <td>
          <div class="thread-title">
            ${thread.is_pinned ? '<span class="pinned-badge">📌</span>' : ''}
            <strong>${thread.title}</strong>
          </div>
        </td>
        <td>${thread.venue}</td>
        <td>${formatDate(thread.date)}</td>
        <td>${thread.author}</td>
        <td>${thread.site_name || 'Unknown'}</td>
        <td>
          <span class="status-badge ${thread.is_pinned ? 'pinned' : 'normal'}">
            ${thread.is_pinned ? 'Pinned' : 'Normal'}
          </span>
        </td>
        <td>${formatDateTime(thread.created_at)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="editThread(${thread.id})">Edit</button>
            <button class="btn-delete" onclick="deleteThread(${thread.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination();
  }

  function renderPagination() {
    const pagination = section.querySelector('.pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(threads.length / rowsPerPage);
    
    pagination.innerHTML = `
      <button class="btn-page" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        Previous
      </button>
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      <button class="btn-page" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        Next
      </button>
    `;
  }

  function openThreadModal(thread = null) {
    currentThread = thread;
    isEditMode = !!thread;
    
    const modal = section.querySelector('.thread-modal');
    const title = modal.querySelector('.modal-title');
    const form = modal.querySelector('.thread-form');
    
    title.textContent = isEditMode ? 'Edit Thread' : 'Create New Thread';
    
    form.innerHTML = `
      <div class="form-group">
        <label for="threadTitle">Title *</label>
        <input type="text" id="threadTitle" value="${thread?.title || ''}" required>
      </div>
      <div class="form-group">
        <label for="threadVenue">Venue *</label>
        <textarea id="threadVenue" rows="3" required>${thread?.venue || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="threadDate">Date *</label>
          <input type="date" id="threadDate" value="${thread?.date || ''}" required>
        </div>
        <div class="form-group">
          <label for="threadSite">Site *</label>
          <select id="threadSite" required>
            <option value="">Select Site</option>
            ${sites.map(site => `
              <option value="${site.id}" ${thread?.site_id == site.id ? 'selected' : ''}>
                ${site.site_name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="threadPinned" ${thread?.is_pinned ? 'checked' : ''}>
          Pin this thread
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-submit">${isEditMode ? 'Update Thread' : 'Create Thread'}</button>
      </div>
    `;
    
    modal.classList.add('active');
  }

  function closeModal() {
    const modal = section.querySelector('.thread-modal');
    modal.classList.remove('active');
    currentThread = null;
    isEditMode = false;
  }

  // -----------------------------
  // 🔹 Event Handlers
  // -----------------------------

  window.editThread = (id) => {
    const thread = threads.find(t => t.id === id);
    if (thread) openThreadModal(thread);
  };

  window.deleteThread = (id) => {
    deleteThread(id);
  };

  window.changePage = (page) => {
    currentPage = page;
    renderThreadsList();
  };

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById('threadTitle').value,
      venue: document.getElementById('threadVenue').value,
      date: document.getElementById('threadDate').value,
      site_id: parseInt(document.getElementById('threadSite').value),
      is_pinned: document.getElementById('threadPinned').checked
    };

    if (isEditMode) {
      updateThread(currentThread.id, formData);
    } else {
      createThread(formData);
    }
  }

  // -----------------------------
  // 🔹 Utility Functions
  // -----------------------------

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function showSuccess(message) {
    showNotification(message, 'success');
  }

  function showError(message) {
    showNotification(message, 'error');
  }

  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // -----------------------------
  // 🔹 Initialize Component
  // -----------------------------

  section.innerHTML = `
    <div class="threads-main-container">
      <div class="threads-header">
        <h2>Threads Management</h2>
        <div class="header-actions">
          <div class="site-filter">
            <label>Filter:</label>
            <select id="siteFilter" class="site-select">
              <option value="all">All Sites</option>
            </select>
          </div>
          <button class="btn-primary" onclick="openThreadModal()">
            + New Thread
          </button>
        </div>
      </div>

      <div class="threads-table-container">
        <table class="threads-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Author</th>
              <th>Site</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div class="pagination"></div>

      <!-- Thread Modal -->
      <div class="thread-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Create New Thread</h3>
            <button class="btn-close" onclick="closeModal()">&times;</button>
          </div>
          <form class="thread-form" onsubmit="handleFormSubmit(event)">
          </form>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  section.querySelector('.thread-form').addEventListener('submit', handleFormSubmit);
  section.querySelector('.btn-close').addEventListener('click', closeModal);

  // Make functions globally available
  window.openThreadModal = openThreadModal;
  window.closeModal = closeModal;
  window.handleFormSubmit = handleFormSubmit;

  // Initialize data
  fetchSites();
  fetchThreads();

  console.log('🎯 Threads component created and returning section...');
  return section;
}
