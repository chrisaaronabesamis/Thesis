// Fetch the list of users that the current user is following
const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';
export async function fetchFollowedUsers(token) {
  try {
    const response = await fetch(`${BINI_URL}/follow/following`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    return [];
  }
}

export function renderUserList(users, chatList, onUserClick) {
  if (!users.length) {
    chatList.innerHTML = '<div style="text-align:center; color:#aaa; margin-top:32px;">No followed users found.</div>';
    return;
  }
  chatList.innerHTML = users.map(user => `
    <div class="user-item" data-user-id="${user.user_id}">
      <img src="${user.profile_picture || 'https://via.placeholder.com/36'}" class="user-avatar" />
      <span class="user-name">${user.fullname || user.username}</span>
    </div>
  `).join('');
  // Add click event for each user
  chatList.querySelectorAll('.user-item').forEach(item => {
    item.onclick = () => {
      if (onUserClick) onUserClick(item.dataset.userId, item.querySelector('.user-name').textContent, item.querySelector('.user-avatar').src);
    };
  });
}