import MessagingModal from "./messages/MessagingModal";
import '../../styles/bini_styles/navigation.css';

/*global badge helper*/
window.updateNavMessageBadge = function (count = 0) {
  const chatBtn = document.querySelector('#newPostNavBtn');
  if (!chatBtn) return;

  let badge = chatBtn.querySelector('.msg-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'msg-badge';
      chatBtn.style.position = 'relative';
      chatBtn.appendChild(badge);
    }
  } else {
    badge?.remove();
  }
  localStorage.setItem('unreadCount', count);
};

/*restore badge on load*/
window.addEventListener('DOMContentLoaded', () => {
  const saved = parseInt(localStorage.getItem('unreadCount') || '0');
  window.updateNavMessageBadge(saved);

  if (window.socket) {
    window.socket.on('unread_count_update', ({ unread_count }) => {
      window.updateNavMessageBadge(unread_count);
    });
  }
});

export default function Navigation(root) {
  root.innerHTML = `
    <nav class="bottom-nav">
      <div class="nav-logo">
        <img src="/bini_logo1.jpg" alt="Logo" class="nav-logo-img" onerror="this.style.display='none';">
      </div>
      <div class="nav-links">
        <a href="http://localhost:5173/bini" id="homecon" class="nav-item">
          <img src="/home-heart.png" alt="Home" class="nav-icon" onerror="this.style.display='none';">
        </a>
        <a href="http://localhost:5173/bini/search" class="nav-item" id="searchcon">
          <img src="/search-heart.png" alt="Search" class="nav-icon" onerror="this.style.display='none';">
        </a>
        <a href="#" class="nav-item" id="newPostNavBtn">
          <img src="/messenger.png" alt="Messages" class="nav-icon" onerror="this.style.display='none';">
        </a>
        <a href="http://localhost:5173/bini/notifications" class="nav-item" id="notifcon">
          <img src="/circle-heart.png" alt="Notifications" class="nav-icon" onerror="this.style.display='none';">
        </a>
        <a href="http://localhost:5173/bini/profile" class="nav-item" id="profilecon">
          <img src="/circle-user.png" alt="Profile" class="nav-icon" onerror="this.style.display='none';">
        </a>
        <a href="http://localhost:5173/" class="nav-item" id="backBtn">
          <img src="/box-arrow-left.svg" alt="Back to Shop" class="nav-icon" onerror="this.style.display='none';">
        </a>
      </div>
    </nav>
  `;

  // --- ACTIVE NAV ICON LOGIC ---
  const path = window.location.pathname;
  if (path === '/' || path === '/index.html') {
    root.querySelector('#homecon').classList.add('active');
  } else if (path.startsWith('/search')) {
    root.querySelector('#searchcon').classList.add('active');
  } else if (path.startsWith('/profile')) {
    root.querySelector('#profilecon').classList.add('active');
  } else if (path.startsWith('/notifications')) {
    root.querySelector('#notifcon').classList.add('active');
  }

  const style = document.createElement('style');
  style.innerHTML = `
    .nav-item.active img {
      filter: brightness(0) saturate(100%) invert(70%) sepia(98%) saturate(748%) hue-rotate(170deg) brightness(101%) contrast(101%);
      border-radius: 8px;
      transition: filter 0.2s, border-bottom 0.2s;
    }
  `;
  document.head.appendChild(style);

  // Initialize messaging modal
  const chatBtn = root.querySelector('#newPostNavBtn');
  if (chatBtn) {
    let messagingModal = null;

    chatBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!messagingModal || !messagingModal.modal) {
        messagingModal = new MessagingModal();
        await messagingModal.show();
        return;
      }

      messagingModal.close();
      messagingModal = null;
    });

    window.addEventListener('beforeunload', () => {
      if (messagingModal) messagingModal.close();
    });
  }
}