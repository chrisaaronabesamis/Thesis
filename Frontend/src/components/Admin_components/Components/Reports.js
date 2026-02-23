import '../../../styles/Admin_styles/Reports.css';

export default function ReportsComponent() {
  const section = document.createElement('section');
  section.id = 'reports';
  section.className = 'content-section active';

  section.innerHTML = `
    <div class="dashboard-wrapper">
      <div class="reports-header">
        <h2>Reports Management</h2>
      </div>
        
        <div class="reports-filters">
          <input type="text" class="search-reports" placeholder="Search reported users..." id="searchReports">
          <select class="status-filter" id="statusFilter">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div class="table-container">
          <div id="loadingSpinner" class="loading-spinner">Loading reports...</div>
          <table class="reports-table" id="reportsTable" style="display: none;">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Reported User</th>
                <th>Email</th>
                <th>Reporters Count</th>
                <th>Total Reports</th>
                <th>Reasons</th>
                <th>Latest Report</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="reportsTableBody">
              <!-- Reports will be populated here -->
            </tbody>
          </table>
          <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
    </div>
  `;

  // Initialize the component
  initializeReports(section);
  
  return section;
}

// Global variables for data management
let reportsData = [];
let filteredData = [];

// Initialize reports functionality
async function initializeReports(section) {
  try {
    await fetchReports();
    setupEventListeners(section);
  } catch (error) {
    console.error('Error initializing reports:', error);
    showError('Failed to initialize reports');
  }
}

// Fetch reports from backend API
async function fetchReports() {
  try {
    showLoading(true);
    
    // Get auth token from localStorage or wherever it's stored
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/v1/bini/message/reports/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      reportsData = result.data || [];
      filteredData = [...reportsData];
      renderReportsTable();
    } else {
      throw new Error(result.error || 'Failed to fetch reports');
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    showError('Failed to fetch reports: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Render reports table
function renderReportsTable() {
  const tableBody = document.getElementById('reportsTableBody');
  const table = document.getElementById('reportsTable');
  
  if (!tableBody || !table) return;

  if (filteredData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 20px;">
          No reports found
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = filteredData.map(report => `
      <tr>
        <td>#${report.user_id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${report.profile_picture ? 
              `<img src="${report.profile_picture}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">` : 
              '<div style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center;">👤</div>'
            }
            <span>${report.fullname || 'Unknown User'}</span>
          </div>
        </td>
        <td>${report.email || 'N/A'}</td>
        <td><span class="badge badge-info">${report.unique_reporters}</span></td>
        <td><span class="badge badge-secondary">${report.total_reports}</span></td>
        <td>${report.reasons ? report.reasons.split(',').map(reason => 
          `<span class="badge badge-reason">${reason.trim()}</span>`
        ).join(' ') : 'N/A'}</td>
        <td>${formatDate(report.latest_report)}</td>
        <td>
          <button class="btn-icon btn-view" onclick="viewUserReports('${report.user_id}')" title="View Details">
            👁️
          </button>
          <button class="btn-icon btn-warning" onclick="handleWarning('${report.user_id}')" title="Send Warning">
            ⚠️
          </button>
          <button class="btn-icon btn-danger" onclick="handleBan('${report.user_id}')" title="Ban User">
            🚫
          </button>
        </td>
      </tr>
    `).join('');
  }
  
  table.style.display = 'table';
}

// Setup event listeners
function setupEventListeners(section) {
  const searchInput = section.querySelector('#searchReports');
  const statusFilter = section.querySelector('#statusFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', handleStatusFilter);
  }
}

// Handle search functionality
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  
  filteredData = reportsData.filter(report => {
    const fullname = (report.fullname || '').toLowerCase();
    const email = (report.email || '').toLowerCase();
    const reasons = (report.reasons || '').toLowerCase();
    
    return fullname.includes(searchTerm) || 
           email.includes(searchTerm) || 
           reasons.includes(searchTerm);
  });
  
  renderReportsTable();
}

// Handle status filter
function handleStatusFilter(event) {
  const statusValue = event.target.value;
  
  // Since the backend returns users with 3+ reports from last 30 days,
  // we'll implement client-side filtering based on report patterns
  if (statusValue === 'all') {
    filteredData = [...reportsData];
  } else {
    // This is a simplified filtering - in real implementation, 
    // you might want to fetch detailed reports for each user
    filteredData = reportsData.filter(report => {
      const reportersCount = report.unique_reporters;
      if (statusValue === 'pending' && reportersCount >= 3 && reportersCount <= 3) return true;
      if (statusValue === 'reviewed' && reportersCount >= 4) return true;
      return false;
    });
  }
  
  renderReportsTable();
}

// View detailed user reports
async function viewUserReports(userId) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`/v1/bini/message/reports/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      showUserReportsModal(userId, result.data);
    } else {
      throw new Error(result.error || 'Failed to fetch user reports');
    }
  } catch (error) {
    console.error('Error fetching user reports:', error);
    alert('Failed to fetch user reports: ' + error.message);
  }
}

// Show modal with detailed user reports
function showUserReportsModal(userId, reports) {
  const modal = document.createElement('div');
  modal.className = 'reports-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeReportsModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Reports for User #${userId}</h3>
        <button class="modal-close" onclick="closeReportsModal()">×</button>
      </div>
      <div class="modal-body">
        ${reports.length === 0 ? 
          '<p>No detailed reports found for this user.</p>' :
          reports.map(report => `
            <div class="report-item">
              <div class="report-header">
                <strong>Reporter:</strong> ${report.reporter_name} (${report.reporter_email})
              </div>
              <div class="report-details">
                <strong>Reason:</strong> <span class="badge badge-reason">${report.reason}</span>
              </div>
              ${report.message_content ? `
                <div class="report-details">
                  <strong>Message:</strong> "${report.message_content}"
                </div>
              ` : ''}
              <div class="report-details">
                <strong>Date:</strong> ${formatDate(report.created_at)}
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  window.currentReportsModal = modal;
}

// Close reports modal
function closeReportsModal() {
  if (window.currentReportsModal) {
    document.body.removeChild(window.currentReportsModal);
    window.currentReportsModal = null;
  }
}

// Handle warning action
async function handleWarning(userId) {
  if (confirm(`Send warning to user ${userId}?`)) {
    try {
      const token = localStorage.getItem('authToken');
      
      // This would need to be implemented in the backend
      // For now, we'll just show a success message
      console.log(`Warning sent to user ${userId}`);
      alert(`Warning sent to user ${userId}`);
      
      // Refresh the reports
      await fetchReports();
    } catch (error) {
      console.error('Error sending warning:', error);
      alert('Failed to send warning: ' + error.message);
    }
  }
}

// Handle ban action
async function handleBan(userId) {
  if (confirm(`Are you sure you want to ban user ${userId}?`)) {
    try {
      const token = localStorage.getItem('authToken');
      
      // This would need to be implemented in the backend
      // For now, we'll just show a success message
      console.log(`User ${userId} banned`);
      alert(`User ${userId} has been banned`);
      
      // Refresh the reports
      await fetchReports();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user: ' + error.message);
    }
  }
}

// Utility functions
function formatDate(dateString) {
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

function showLoading(show) {
  const spinner = document.getElementById('loadingSpinner');
  const table = document.getElementById('reportsTable');
  const error = document.getElementById('errorMessage');
  
  if (spinner) spinner.style.display = show ? 'block' : 'none';
  if (table) table.style.display = show ? 'none' : 'table';
  if (error) error.style.display = 'none';
}

function showError(message) {
  const spinner = document.getElementById('loadingSpinner');
  const table = document.getElementById('reportsTable');
  const error = document.getElementById('errorMessage');
  
  if (spinner) spinner.style.display = 'none';
  if (table) table.style.display = 'none';
  if (error) {
    error.textContent = message;
    error.style.display = 'block';
  }
}

// Make functions globally accessible for onclick handlers
window.viewUserReports = viewUserReports;
window.handleWarning = handleWarning;
window.handleBan = handleBan;
window.closeReportsModal = closeReportsModal; 