import { api } from '../../services/ecommerce_services/config.js';
import { getAuthToken, removeAuthToken, authHeaders } from '../../services/ecommerce_services/auth/auth.js';
import CustomerCart from './cart/customer_cart_modal.js';
import { showToast, showConfirmToast } from '../../utils/toast.js';
import { BINI_API_URL } from '../../config/bini-api.js';

export default function Navigation(root) {
  root.innerHTML = `
  <header class="navbar">
    <div id="menuToggle" class="menu-toggle">☰</div>
    <a href="/" class="logo">
      <img src="/BINI_logo.svg.png" alt="BINI Logo">
    </a>
    <nav id="navMenu">
      <button class="nav-close-btn" aria-label="Close navigation">✕</button>
      <a href="/" class="nav-link active">Home</a>
      <a href="#about" class="nav-link">About</a>
      <a href="#music" class="nav-link">Music</a>
      <a href="#events" class="nav-link">Events</a>
      <a href="#announcement" class="nav-link">Announcement</a>
      <a href="/shop" class="nav-link">Shop</a>
      <a href="#community" class="nav-link">Community</a>
    </nav>
    <div class="nav-right">
      <a href="/order-history" class="nav-icon">📜</a>
      <a href="/cart" class="nav-icon">🛒</a>
      <a href="/signin" id="signinLink" class="nav-icon">👤</a>
      <a href="#" id="logoutBtn" class="nav-icon" style="display:none" title="Logout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16,17 21,12 16,7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </a>
      
    </div>
  </header>
  `;
  // check if user is already login 
  const isAuthenticated = () => !!getAuthToken();

  const navbar = root.querySelector('.navbar');
  const menuToggle = root.querySelector('#menuToggle');
  const navMenu = root.querySelector('#navMenu');
  const navLinks = navMenu ? Array.from(navMenu.querySelectorAll('a')) : [];
  const navCloseBtn = root.querySelector('.nav-close-btn');

  menuToggle?.addEventListener('click', () => {
    if (!navMenu) return;
    navMenu.classList.toggle('active');
    menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
  });

  navCloseBtn?.addEventListener('click', () => {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    if (menuToggle) menuToggle.textContent = '☰';
  });

  navLinks.forEach(link => {
  link.addEventListener('click', async (e) => {
    const href = link.getAttribute('href') || '';

 
    // Check if user is authenticated for protected routes
    if ((href === '/shop' || href === '#community') && !isAuthenticated()) {
      e.preventDefault();
      showToast('You need an account to access this feature. Please sign in or sign up.', 'error');
      window.location.href = '/signin';
      return;
    }

    if (href === '#community') {
  e.preventDefault();

  try {

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders()  // <-- 🔥 token is included here
    };

    console.log("Sending headers:", headers);

    const res = await fetch(`${BINI_API_URL}/community/enterBini`, {
      method: "GET",
      headers
    });

    if (!res.ok) throw new Error("Backend responded with " + res.status);

    const body = await res.json();
    console.log("Backend Response:", body);

    // Store response if needed
    localStorage.setItem("sharedBody", JSON.stringify(body));

    const tempToken = body.tempToken;
    if (!tempToken) {
      showToast("Backend did not return temporary token", 'error');
      return;
    }

    showToast("Temporary token generated successfully", 'success');

    // Redirect to bini community with authorization
    window.location.href = `http://localhost:5173/bini?token=${encodeURIComponent(tempToken)}`;

  } catch (err) {
    console.error("Community fetch failed:", err);
  }

  return;
}


    // ⭐⭐⭐ COMMUNITY LOGIC END ⭐⭐⭐

    // Below = Default logic for scrolling / linking anchors
    if (!href.startsWith('#')) return;
    const targetId = href.slice(1);

    const findSection = () => document.getElementById(targetId) ||
      document.querySelector(`section.${targetId}-section`) ||
      document.querySelector(`section.${targetId}`) ||
      document.querySelector(`.${targetId}`);

    let targetSection = findSection();

    if (targetSection) {
      e.preventDefault();
      const headerHeight = 80; // Approximate navbar height
      const targetPosition = targetSection.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navMenu?.classList.remove('active');
      if (menuToggle) menuToggle.textContent = '☰';
      return;
    }

    if (targetId === '') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    e.preventDefault();
    const newUrl = `/${'#' + targetId}`;
    history.pushState({}, '', newUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));

    setTimeout(() => {
      targetSection = findSection();
      if (targetSection) {
        const headerHeight = 80; // Approximate navbar height
        const targetPosition = targetSection.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
      navMenu?.classList.remove('active');
      if (menuToggle) menuToggle.textContent = '☰';
    }, 350);
  });
});


  const navRightLinks = root.querySelectorAll('.nav-right a');
  navRightLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('id') || '';
      if (id === 'logoutBtn') return;
      if (!isAuthenticated()) {
        e.preventDefault();
        showToast('You need an account to access this feature. Please sign in or sign up.', 'error');
        window.location.href = '/signin';
      }
    });
  });

  // Handle cart modal
  const cartLink = root.querySelector('a[href="/cart"]');
  if (cartLink) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isAuthenticated()) {
        showToast('You need an account to access this feature. Please sign in or sign up.', 'error');
        window.location.href = '/signin';
        return;
      }
      CustomerCart();
    });
  }

  const signinLink = root.querySelector('#signinLink');
  const logoutBtn = root.querySelector('#logoutBtn');

  function updateAuthLinks() {
    const auth = isAuthenticated();
    if (auth) {
      signinLink && (signinLink.style.display = 'none');
      logoutBtn && (logoutBtn.style.display = 'inline');
    } else {
      signinLink && (signinLink.style.display = 'inline');
      logoutBtn && (logoutBtn.style.display = 'none');
    }
  }

  updateAuthLinks();

  logoutBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Show toast confirmation dialog
    showConfirmToast(
      'Are you sure you want to log out?',
      async () => {
        // User confirmed logout
        try {
          await fetch(api('/v1/users/logout'), {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            credentials: 'include'
          });
        } catch (err) {
          console.error('Logout request failed', err);
        }

        removeAuthToken();
        updateAuthLinks();
        showToast('You have been logged out successfully', 'success');
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      },
      () => {
        // User cancelled logout - do nothing
        console.log('Logout cancelled by user');
      }
    );
  });

  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id], section[class]');

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 180) {
        current = section.getAttribute('id') || section.className.split(' ')[0];
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#') && href.slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
}
