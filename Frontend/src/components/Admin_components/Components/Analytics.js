import '../../../styles/Admin_styles/Analytics.css';

export default function Analytics() {
  const section = document.createElement('section');
  section.id = 'analytics';
  section.className = 'content-section active';

  section.innerHTML = `
    <div class="section-header">
      <h2>Analytics & Reports</h2>
    </div>

    <div class="analytics-grid">
      <div class="analytics-card">
        <h3>Top Products</h3>
        <div class="analytics-list">
          <div class="analytics-item">
            <span>BINI T-Shirt</span>
            <span class="analytics-value">234 sold</span>
          </div>
          <div class="analytics-item">
            <span>Album Bundle</span>
            <span class="analytics-value">156 sold</span>
          </div>
          <div class="analytics-item">
            <span>Concert Tickets</span>
            <span class="analytics-value">89 sold</span>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <h3>User Demographics</h3>
        <div class="analytics-list">
          <div class="analytics-item">
            <span>Age 13-18</span>
            <span class="analytics-value">45%</span>
          </div>
          <div class="analytics-item">
            <span>Age 19-25</span>
            <span class="analytics-value">35%</span>
          </div>
          <div class="analytics-item">
            <span>Age 26+</span>
            <span class="analytics-value">20%</span>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <h3>Engagement Metrics</h3>
        <div class="analytics-list">
          <div class="analytics-item">
            <span>Avg. Session Time</span>
            <span class="analytics-value">24 min</span>
          </div>
          <div class="analytics-item">
            <span>Daily Active Users</span>
            <span class="analytics-value">892</span>
          </div>
          <div class="analytics-item">
            <span>Bounce Rate</span>
            <span class="analytics-value">12%</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}