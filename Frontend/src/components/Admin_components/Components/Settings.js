import '../../../styles/Admin_styles//Settings.css';

export default function createSettings() {
  const section = document.createElement("section");
  section.id = "settings";
  section.className = 'content-section active';

  section.innerHTML = `
    <div class="section-header">
      <h2>System Customizer</h2>
    </div>

    <div class="customizer-grid">

      <!-- Theme Colors -->
      <div class="customizer-section">
        <h3>Theme Colors</h3>
        <div class="color-options">
          <div class="color-option" data-theme="default">
            <div class="color-preview" style="background:#4f46e5;"></div>
            <span>Default</span>
          </div>
          <div class="color-option" data-theme="blue">
            <div class="color-preview" style="background:#3b82f6;"></div>
            <span>Blue</span>
          </div>
          <div class="color-option" data-theme="green">
            <div class="color-preview" style="background:#10b981;"></div>
            <span>Green</span>
          </div>
          <div class="color-option" data-theme="purple">
            <div class="color-preview" style="background:#8b5cf6;"></div>
            <span>Purple</span>
          </div>
        </div>
      </div>

      <!-- Layout Settings -->
      <div class="customizer-section">
        <h3>Layout Settings</h3>
        <div class="customizer-item">
          <label>Sidebar Width</label>
          <select id="sidebarWidth">
            <option value="compact">Compact</option>
            <option value="normal" selected>Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>
        <div class="customizer-item">
          <label>Header Style</label>
          <select id="headerStyle">
            <option value="static">Static</option>
            <option value="fixed">Fixed</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div class="customizer-item">
          <label>Navigation Style</label>
          <select id="navStyle">
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="customizer-section">
        <h3>Advanced Settings</h3>
        <div class="customizer-item">
          <label>Shadow Intensity</label>
          <input type="range" id="shadowIntensity" min="0" max="2" step="0.5" value="1">
        </div>
        <div class="customizer-item">
          <label>Animation Speed</label>
          <select id="animationSpeed">
            <option value="fast">Fast</option>
            <option value="normal" selected>Normal</option>
            <option value="slow">Slow</option>
            <option value="none">None</option>
          </select>
        </div>
        <div class="customizer-item">
          <label>Rounded Corners</label>
          <select id="borderRadius">
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md" selected>Medium</option>
            <option value="lg">Large</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="customizer-section">
        <h3>Notifications</h3>
        <div class="customizer-item">
          <label class="switch">
            <input type="checkbox" id="emailNotifications" checked>
            <span class="slider round"></span>
            <span>Email Notifications</span>
          </label>
        </div>
        <div class="customizer-item">
          <label class="switch">
            <input type="checkbox" id="pushNotifications" checked>
            <span class="slider round"></span>
            <span>Push Notifications</span>
          </label>
        </div>
        <div class="customizer-item">
          <label class="switch">
            <input type="checkbox" id="soundNotifications" checked>
            <span class="slider round"></span>
            <span>Sound Alerts</span>
          </label>
        </div>
      </div>

    </div>

    <div class="customizer-actions">
      <button class="btn btn-secondary" id="resetSettingsBtn">Reset to Default</button>
      <button class="btn btn-primary" id="saveSettingsBtn">Save Changes</button>
    </div>
  `;

  function initSettings() {
    console.log("[Settings] loaded");
    setupThemeSelector();
    setupButtons();
  }

  function setupThemeSelector() {
    section.querySelectorAll(".color-option").forEach(opt => {
      opt.addEventListener("click", () => {
        const theme = opt.dataset.theme;
        console.log("[Settings] Theme changed to:", theme);

        section.querySelectorAll(".color-option")
          .forEach(o => o.classList.remove("active"));
        opt.classList.add("active");

      });
    });
  }

  function setupButtons() {
    const resetBtn = section.querySelector("#resetSettingsBtn");
    const saveBtn = section.querySelector("#saveSettingsBtn");

    resetBtn.addEventListener("click", resetSettings);
    saveBtn.addEventListener("click", saveSettings);
  }

  function resetSettings() {
    console.log("[Settings] Reset to default");

    section.querySelector("#sidebarWidth").value = "normal";
    section.querySelector("#headerStyle").value = "static";
    section.querySelector("#navStyle").value = "vertical";
    section.querySelector("#shadowIntensity").value = 1;
    section.querySelector("#animationSpeed").value = "normal";
    section.querySelector("#borderRadius").value = "md";

    section.querySelector("#emailNotifications").checked = true;
    section.querySelector("#pushNotifications").checked = true;
    section.querySelector("#soundNotifications").checked = true;

    section.querySelectorAll(".color-option")
      .forEach(o => o.classList.remove("active"));
  }

  function saveSettings() {
    const settings = {
      sidebarWidth: section.querySelector("#sidebarWidth").value,
      headerStyle: section.querySelector("#headerStyle").value,
      navStyle: section.querySelector("#navStyle").value,
      shadowIntensity: section.querySelector("#shadowIntensity").value,
      animationSpeed: section.querySelector("#animationSpeed").value,
      borderRadius: section.querySelector("#borderRadius").value,
      emailNotifications: section.querySelector("#emailNotifications").checked,
      pushNotifications: section.querySelector("#pushNotifications").checked,
      soundNotifications: section.querySelector("#soundNotifications").checked,
    };

    console.log("[Settings] Saved:", settings);
  }

  function exportUsers() {
    console.log("Export users");
  }

  function exportOrders() {
    console.log("Export orders");
  }

  function exportPayments() {
    console.log("Export payments");
  }

  initSettings();

  return section;
}
