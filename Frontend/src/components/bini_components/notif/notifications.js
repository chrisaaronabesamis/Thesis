import { fetchNotifications } from '../../../services/bini_services/notif/fetchnotif.js';
import { fetchUserById } from '../../../services/bini_services/user/fetchUserById.js';
import { fetchPostById } from '../../../services/bini_services/post/fetchPostById.js';
import { repost } from '../../../services/bini_services/post/repost.js';
import createCommentModal from '../post/comment_modal.js';
import { renderThreadsSidebar } from '../threadsSidebar.js';
import { BINI_API_URL } from '../../../config/bini-api.js';


// Format date helper function
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

export default async function Notifications(root) {
  const threadsSidebarHtml = await renderThreadsSidebar();
  
  root.innerHTML = `
    <div class="notifications-container">
      <div class="notifications-panel"></div>
      <div class="homepage-right">
        ${threadsSidebarHtml.html}
      </div>
    </div>
  `;

  const sidebarContainer = root.querySelector('.threads-sidebar');
  if (sidebarContainer && threadsSidebarHtml.setupClickHandlers) {
    threadsSidebarHtml.setupClickHandlers(sidebarContainer);
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    root.querySelector('.notifications-panel').innerHTML = '<p>Please login first.</p>';
    return;
  }

  try {
    const raw = await fetchNotifications(token);
    const notifs = Array.isArray(raw) ? raw : (raw?.notifications ?? raw?.data ?? []);
    renderNotifications(notifs, token, root.querySelector('.notifications-panel'));
  } catch (error) {
    root.querySelector('.notifications-panel').innerHTML = `<p>Error loading notifications: ${error.message}</p>`;
  }
}
// Render notifications list
async function renderNotifications(notifs, token, panel) {
  panel.innerHTML = `<h3></h3><ul style="list-style:none;padding:0;" id="notif-list"></ul>`;
  const notifList = panel.querySelector('#notif-list');

  if (notifs.length === 0) {
    notifList.innerHTML = '<li>No notifications.</li>';
    return;
  }

  for (const notif of notifs) {
    let fromUser = 'Someone';
    let profilePic = 'default-profile.png';

    if (notif.source_user_id) {
      try {
        const user = await fetchUserById(notif.source_user_id, token);
        fromUser = user.user?.fullname || user.fullname || `User #${notif.source_user_id}`;
        profilePic = user.user?.profile_picture || user.profile_picture || 'default-profile.png';
      } catch (e) {
        fromUser = `User #${notif.source_user_id}`;
      }
    }

    const notifHtml = `
      <li 
        class="notif-item" 
        style="padding:8px 0;border-bottom:1px solid #eee;display:flex;align-items:center;gap:8px;cursor:${notif.post_id ? 'pointer' : 'default'};"
        ${notif.post_id ? `data-postid="${notif.post_id}"` : ''}
      >
        <img src="${profilePic}" alt="${fromUser}" style="width:32px;height:32px;border-radius:50%;">
        <span>
        ${
          notif.activity_type === 'like'
            ? `<b>${fromUser}</b> liked your post.`
            : notif.activity_type === 'follow'
            ? `<b>${fromUser}</b> followed you.`
            : notif.activity_type === 'repost'
            ? `<b>${fromUser}</b> reposted your post.`
            : notif.activity_type === 'comment'
            ? `<b>${fromUser}</b> commented on your post.`
            : 'You have a new notification.'
        }
        <span style="font-size:12px;color:#888;">${formatDate(notif.created_at)}</span>
        </span>
      </li>
    `;
    notifList.insertAdjacentHTML('beforeend', notifHtml);
  }
  // Click event for notifications with post_id (show modal)
  notifList.querySelectorAll('.notif-item[data-postid]').forEach((li) => {
    li.addEventListener('click', async function () {
      const postId = this.getAttribute('data-postid');
      if (postId) {
        try {
          const post = await fetchPostById(postId, token);
          showPostModal(post, token);
        } catch (err) {
          alert('Failed to load post.');
        }
      }
    });
  });
}
// Fetch like status
async function fetchIsLikedStatus(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/likes/check/post/${postId}`, {     
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check like status');
    }

    const { isLiked } = await response.json();
    return isLiked;
  } catch (error) {
    return false;
  }
}
// Fetch like counts
async function fetchLikedcounts(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/likes/count/post/${postId}`, { 
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch like count');
    }

    const { likeCount } = await response.json();
    return likeCount;
  } catch (error) {
    return 0;
  }
}
// Toggle like function
async function toggleLike(postId, token, likeType = 'post', commentId = null) {
  try {
    const url = `${BINI_API_URL}/likes/toggle/${likeType}/${postId}${commentId ? `/${commentId}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': `thread`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
// Show post modal
async function showPostModal(post, token) {
  const oldModal = document.querySelector('.notif-post-modal');
  if (oldModal) oldModal.remove();
  // Get like status and count
  const isLiked = await fetchIsLikedStatus(post.post_id, token);
  const likeCount = await fetchLikedcounts(post.post_id, token);

  const modal = document.createElement('div');
  modal.className = 'notif-post-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  const tagsHtml =
    post.tags && post.tags.length > 0
      ? `<div class="post-tags">${Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}</div>`
      : '';
  const imageHtml = post.img_url
    ? `<img src="${post.img_url}" alt="Post Image" class="post-image" style="max-width:100%;margin-top:8px;" />`
    : '';

  modal.innerHTML = `
    <div style="background:#fff;padding:24px;border-radius:8px;min-width:320px;max-width:90vw;max-height:80vh;overflow-y:auto;position:relative;">
      <span style="position:absolute;top:8px;right:16px;cursor:pointer;font-size:24px;" id="closeModalBtn">&times;</span>
      <div class="post-card">
        <div class="post-meta1" style="display:flex;align-items:center;gap:12px;">
          <a href="#" class="profile-link" data-user-id="${post.user_id}">
            <img src="${post.profile_picture || '/circle-user.png'}" class="profile-picture" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.src='/circle-user.png';">
          </a>
          <a href="#" class="profile-link" data-user-id="${post.user_id}">
            <span class="post-fullname" style="font-weight:bold;">${post.fullname || 'Unknown User'}</span>
          </a>
          <span class="post-time" style="margin-left:auto;font-size:12px;color:#888;">${formatDate(post.created_at)}</span>
        </div>
        <div class="post-content" style="margin:12px 0;">${post.content || 'No content available'}</div>
        ${tagsHtml}
        ${imageHtml}
        <div class="post-actions" style="margin-top:16px;display:flex;gap:24px;">
          <button class="post-action like-button ${isLiked ? 'liked' : ''}" data-post-id="${post.post_id}" data-like-type="post">
            <span class="material-icons ${isLiked ? 'liked' : ''}">favorite_border</span>
            <span class="like-count">${likeCount}</span>
          </button>
          <button class="post-action comment-button" data-post-id="${post.post_id}">
            <span class="material-icons">chat_bubble_outline</span>
          </button>
          <button class="post-action repostbtn" data-post-id="${post.post_id}">
            <span class="material-icons">repeat</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#closeModalBtn').onclick = () => modal.remove();

  // Profile link event
  modal.querySelectorAll('.profile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const userId = link.getAttribute('data-user-id');
      localStorage.setItem('selectedUserId', userId);
      window.history.pushState({}, '', `/bini/others-profile`);
      window.dispatchEvent(new Event('popstate'));
      modal.remove();
    });
  });

  // Like button event
  modal.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.getAttribute('data-post-id');
      const likeType = button.getAttribute('data-like-type');
      try {
        const updatedLikeData = await toggleLike(postId, token, likeType);
        const likeCountElement = button.querySelector('.like-count');
        const likeIcon = button.querySelector('.material-icons');

        likeCountElement.textContent = updatedLikeData.likes;
        likeIcon.classList.toggle('liked', updatedLikeData.isLiked);
        button.classList.toggle('liked', updatedLikeData.isLiked);
      } catch (error) {
        alert("Error updating like: " + error.message);
      }
    });
  });

  // Repost button event
  modal.querySelectorAll('.repostbtn').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.getAttribute('data-post-id');
      try {
        await repost(postId, token);
      } catch (error) {
        alert('Repost failed: ' + error.message);
      }
    });
  });

  // Comment button event
  modal.querySelectorAll('.comment-button').forEach(button => {
    button.addEventListener('click', () => {
      const postId = button.getAttribute('data-post-id');
      try {
        createCommentModal(postId); 
      } catch (error) {
        alert("Error opening comments: " + error.message);
      }
    });
  });
}