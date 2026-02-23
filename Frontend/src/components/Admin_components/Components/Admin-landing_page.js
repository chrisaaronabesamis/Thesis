import '../../../styles/Admin_styles/Admin-landing_page.css';

// Configuration from admin.json
const config = {
  validation: {
    rules: {
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      password: {
        minLength: 8,
        message: 'Password must be at least 8 characters'
      },
      required: {
        message: 'This field is required'
      }
    }
  }
};

// Utility functions
const utils = {
  // Form validation
  validateField: (input, rules) => {
    const value = input.value.trim();
    const fieldName = input.name || input.id || 'field';
    const errors = [];

    if (input.required && !value) {
      errors.push(config.validation.rules.required.message);
      return { isValid: false, errors };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.message || 'Invalid format');
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(rules.message || `Must be at least ${rules.minLength} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Show error message
  showError: (input, message) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      formGroup.appendChild(errorElement);
    }

    errorElement.textContent = message;
    input.classList.add('error');
  },

  // Clear error
  clearError: (input) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
    input.classList.remove('error');
  },

  // Smooth scroll to element
  smoothScroll: (targetId) => {
    const target = document.querySelector(targetId);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  },

  // Toggle mobile menu
  toggleMobileMenu: () => {
    const navMobile = document.querySelector('#navMobile');
    const menuBtn = document.querySelector('#mobileMenuBtn');
    if (navMobile && menuBtn) {
      navMobile.classList.toggle('active');
      menuBtn.classList.toggle('active');
    }
  }
};

export default function AdminLandingPage() {
  const section = document.createElement('section');
  section.id = 'admin-landing';
  // Use a specific class to avoid global `.content-section` rules
  // (some page styles hide `.content-section` by default)
  section.className = 'admin-landing-section';

  section.innerHTML = `
  <div class="admin-landing-wrapper">
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="logo">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="#ff4b8d" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <span class="logo-text">FanHub</span>
        </div>
        <nav class="nav-desktop">
          <a href="#templates" class="nav-link">Templates</a>
          <a href="#features" class="nav-link">Features</a>
          <a href="#success" class="nav-link">Success</a>
        </nav>
        <div class="header-actions">
          <button id="getStartedBtn" class="btn btn-primary">Get Started</button>
        </div>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <nav class="nav-mobile" id="navMobile">
        <a href="#templates" class="nav-link">Templates</a>
        <a href="#features" class="nav-link">Features</a>
        <a href="#success" class="nav-link">Success</a>
      </nav>
    </header>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Platform Made for Fan Communities</h1>
          <p class="hero-description">
            Everything creators need to build and monetize their fan communities. 
            Templates, tools, and integrations designed specifically for passionate fandoms
          </p>
        </div>
        <!-- Auth Tabs -->
        <div class="auth-container">
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Sign In</button>
            <button class="auth-tab" data-tab="signup">Sign Up</button>
          </div>
          <div class="auth-card">
            <!-- Login Form -->
            <form class="auth-form active" id="loginForm" data-form="login">
              <div class="form-header">
                <h3 class="form-title">Welcome Back</h3>
                <p class="form-subtitle">Enter your credentials to access your admin dashboard.</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="loginEmail">Email</label>
                <input type="email" id="loginEmail" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="loginPassword">Password</label>
                <input type="password" id="loginPassword" class="form-input" required>
              </div>
              <div class="form-row">
                <a href="#" class="form-link">Forgot password?</a>
              </div>
              <button type="submit" class="btn btn-primary btn-full">Sign In</button>
              <div class="divider">
                <span>Or continue with</span>
              </div>
              <div class="social-buttons" style="display:flex;justify-content:center;">
                <button type="button" class="btn btn-outline">Google</button>
              </div>
              <p class="form-footer">
                Don't have an account? <button type="button" class="tab-switch" data-target="signup">Sign up</button>
              </p>
            </form>
            <!-- Signup Form -->
            <form class="auth-form" id="signupForm" data-form="signup">
              <div class="form-header">
                <h3 class="form-title">Create Your Account</h3>
                <p class="form-subtitle">Join thousands of successful admin communities.</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="signupName">Full Name</label>
                <input type="text" id="signupName" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="signupEmail">Email</label>
                <input type="email" id="signupEmail" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="signupCommunity">Community Name</label>
                <input type="text" id="signupCommunity" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="signupPassword">Password</label>
                <input type="password" id="signupPassword" class="form-input" required>
              </div>
              <button type="submit" class="btn btn-primary btn-full">Create Account</button>
              <div class="divider">
                <span>Or sign up with</span>
              </div>
              <div class="social-buttons" style="display:flex;justify-content:center;">
                <button type="button" class="btn btn-outline">Google</button>
              </div>
              <p class="form-footer">
                Already have an account? <button type="button" class="tab-switch" data-target="login">Sign in</button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
    <!-- Features Section -->
    <section id="features" class="features">
      <div class="features-container">
        <div class="section-header">
          <h2 class="section-title">Everything for Your Community</h2>
          <p class="section-subtitle">
            Powerful features designed specifically to help you build, engage, and grow your admin community.
          </p>
        </div>
        <div class="features-grid" id="featuresGrid">
          <!-- Features injected via JS from admin.json -->
        </div>
        <!-- Templates: ready-made band templates (placed under Features) -->
        <div id="templates" class="templates-section" style="margin-top:2rem;">
          <div class="section-header">
            <h3 class="section-title">Community Templates</h3>
            <p class="section-subtitle">Choose from our professionally designed templates optimized for different types of fan communities. Fully customizable to match your brand.</p>
          </div>
          <div class="features-grid templates-grid" id="templatesGrid">
            <!-- Templates injected via JS -->
          </div>
        </div>
      </div>
    </section>
    <!-- Success Stories Section -->
    <section id="success" class="success">
      <div class="success-container">
        <div class="section-header">
          <h2 class="section-title">Success Stories</h2>
          <p class="section-subtitle">Join thousands of thriving communities using AdminHub</p>
        </div>
        <div class="success-grid" id="successGrid">
          <!-- Success stories injected via JS from admin.json -->
        </div>
      </div>
    </section>
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="#ff4b8d" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <span class="logo-text">FanHub</span>
            </div>
            <p class="footer-tagline">Build and manage your admin communities.</p>
          </div>
          <div class="footer-column">
            <h4 class="footer-heading">Product</h4>
            <ul class="footer-links">
              <li><span>Features</span></li>
              <li><span>Pricing</span></li>
              <li><span>Security</span></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-heading">Company</h4>
            <ul class="footer-links">
              <li><span>About</span></li>
              <li><span>Blog</span></li>
              <li><span>Contact</span></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-heading">Legal</h4>
            <ul class="footer-links">
              <li><span>Privacy</span></li>
              <li><span>Terms</span></li>
              <li><span>Cookies</span></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 AdminHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>
    <!-- Feature Detail Modal -->
    <div id="featureModal" class="modal" aria-hidden="true">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button class="modal-close" id="modalClose" aria-label="Close">&times;</button>
        <div class="modal-body">
          <div id="modalIcon" class="feature-icon"></div>
          <h3 id="modalTitle" class="feature-title"></h3>
          <p id="modalDescription" class="feature-description"></p>
        </div>
      </div>
    </div>
  </div>
</section>
`;

  // Initialize form validation
  const initFormValidation = () => {
    const forms = section.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Clear error on input
        input.addEventListener('input', () => {
          utils.clearError(input);
        });
      });

      // Form submission
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        inputs.forEach(input => {
          const rules = {};
          
          if (input.required) {
            rules.required = true;
          }
          
          if (input.type === 'email') {
            Object.assign(rules, config.validation.rules.email);
          }
          
          if (input.type === 'password') {
            Object.assign(rules, config.validation.rules.password);
          }
          
          if (Object.keys(rules).length > 0) {
            const validation = utils.validateField(input, rules);
            if (!validation.isValid) {
              isValid = false;
              validation.errors.forEach(error => {
                utils.showError(input, error);
              });
            }
          }
        });
        
        if (isValid) {
          // Handle form submission
          const formData = new FormData(form);
          const formValues = Object.fromEntries(formData.entries());
          console.log('Form submitted:', formValues);
          
          // Show success message
          const formType = form.id === 'loginForm' ? 'Login' : 'Signup';
          showToast(`${formType} successful!`, 'success');
          
          // Reset form
          form.reset();
        }
      });
    });
  };

  // Initialize event listeners
  const initEventListeners = () => {
    // Smooth scroll for anchor links
    section.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          utils.smoothScroll(href);
        }
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = section.querySelector('#mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', utils.toggleMobileMenu);
    }

    // Close mobile menu when clicking on a link
    section.querySelectorAll('#navMobile a').forEach(link => {
      link.addEventListener('click', utils.toggleMobileMenu);
    });
  };

  // Initialize the component
  const initialize = () => {
    initFormValidation();
    initEventListeners();

    // Auth Tabs Functionality
    const authTabs = section.querySelectorAll('.auth-tab');
    const authForms = section.querySelectorAll('.auth-form');
    const tabSwitches = section.querySelectorAll('.tab-switch');

    function switchTab(tabName) {
      authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });
      authForms.forEach(form => {
        form.classList.toggle('active', form.dataset.form === tabName);
      });
    }

    authTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    tabSwitches.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.target));
    });

    // Form submissions
    const loginForm = section.querySelector('#loginForm');
    const signupForm = section.querySelector('#signupForm');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        showToast(`Welcome back! Signed in as ${email}`, 'success');
      });
    }

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        showToast(`Account created for ${email}`, 'success');
      });
    }

    // Initialize features and templates
    renderFeatures();
    renderTemplates();
    renderSuccessStories();
  };

  // Helper functions
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }, 100);
  }

  // Render features from config
  const renderFeatures = () => {
    const featuresGrid = section.querySelector('#featuresGrid');
    if (!featuresGrid) return;

    const features = [
      {
        icon: 'users',
        title: 'Community Management',
        description: 'Organize members, create roles, and manage permissions with intuitive tools.'
      },
      {
        icon: 'trending-up',
        title: 'Growth Analytics',
        description: 'Track engagement metrics, member growth, and community health in real-time.'
      },
      {
        icon: 'zap',
        title: 'Engagement Tools',
        description: 'Polls, events, contests, and interactive features to keep members active.'
      },
      {
        icon: 'shield',
        title: 'Security & Moderation',
        description: 'Enterprise-grade security, content moderation, and member verification.'
      },
      {
        icon: 'bar-chart-3',
        title: 'Advanced Analytics',
        description: 'Detailed insights into member behavior, engagement, and community trends.'
      },
      {
        icon: 'check-circle',
        title: 'Monetization',
        description: 'Multiple revenue streams through memberships, sponsorships, and products.'
      }
    ];

    const icons = {
      users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      'trending-up': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
      zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      'bar-chart-3': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
      'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };

    featuresGrid.innerHTML = features.map(feature => `
      <div class="feature-card">
        <div class="feature-icon">${icons[feature.icon] || ''}</div>
        <h3 class="feature-title">${feature.title}</h3>
        <p class="feature-description">${feature.description}</p>
      </div>
    `).join('');
  }

  // Render templates
  const renderTemplates = () => {
    const templatesGrid = section.querySelector('#templatesGrid');
    if (!templatesGrid) return;

    const templates = [
      { name: 'SB19', desc: 'Official SB19 fan community template — fan updates, charts, and merch.', emoji: '🎤' },
      { name: 'BTS', desc: 'Built for BTS fans — music discussion, streaming parties, and fan events.', emoji: '🎶' },
      { name: 'BLACKPINK', desc: 'BLACKPINK template for fan news, fashion, and concert meetups.', emoji: '💖' },
      { name: 'IV of Spade', desc: 'IV of Spade community layout for band news, shows, and merch drops.', emoji: '🎸' },
      { name: 'Maroon 5', desc: 'Maroon 5 template — tour updates, playlists, and fan chats.', emoji: '🎷' },
      { name: 'The Beatles', desc: 'Classic Beatles fan template — archives, discussions, and events.', emoji: '🎵' }
    ];

    templatesGrid.innerHTML = templates.map(template => `
      <div class="template-card">
        <div class="feature-icon"><span style="font-size:28px;display:inline-block">${template.emoji}</span></div>
        <h3 class="feature-title">${template.name}</h3>
        <p class="feature-description">${template.desc}</p>
        <div style="margin-top:1.25rem;">
          <button class="btn btn-primary btn-full use-template" data-template="${template.name}">Use Template</button>
        </div>
      </div>
    `).join('');

    // Add event listeners for template buttons
    const templateButtons = section.querySelectorAll('.use-template');
    templateButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.getAttribute('data-template');
        showToast(`Selected ${template} template`, 'success');
      });
    });
  }

  // Render success stories
  const renderSuccessStories = () => {
    const successGrid = section.querySelector('#successGrid');
    if (!successGrid) return;

    const stories = [
      { stat: '50K+', label: 'Active Members', description: 'Grew from 5K to 50K members in 6 months' },
      { stat: '$100K+', label: 'Revenue Generated', description: 'Generated through memberships and sponsorships' },
      { stat: '30K+', label: 'Daily Active Users', description: 'Thriving community with high engagement' }
    ];

    successGrid.innerHTML = stories.map(story => `
      <div class="success-card">
        <p class="success-stat">${story.stat}</p>
        <p class="success-label">${story.label}</p>
        <p class="success-description">${story.description}</p>
      </div>
    `).join('');
  }

  // Initialize the component
  setTimeout(initialize, 0);

  return section;
}