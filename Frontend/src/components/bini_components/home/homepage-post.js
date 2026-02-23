import { fetchrandomposts } from '../../../services/bini_services/post/fetchrandompost.js';
import { repost } from '../../../services/bini_services/post/repost.js';
import createCommentModal from '../post/comment_modal.js';
import { renderThreadsSidebar } from '../threadsSidebar.js';
import { BINI_API_URL } from '../../../config/bini-api.js';

let isLoading = false;

export default async function Homepage(root) {
  const threadsSidebar = await renderThreadsSidebar();
  
  root.innerHTML = `
    <div class="homepage-container">
      <div class="homepage-feed"></div>
      <div class="homepage-right">
        ${threadsSidebar.html}
      </div>
    </div>

    <!-- IMAGE MODAL (LOCAL TO THIS PAGE) -->
    <div id="image-modal" class="image-modal">
      <div class="modal-header">
        <button class="download-button" id="download-btn" title="Download Image">
          <span class="material-icons">download</span>
        </button>

        <!-- ZOOM BUTTONS -->
        <div class="zoom-controls">
          <button id="zoom-in">➕</button>
          <button id="zoom-out">➖</button>
        </div>

        <span class="modal-close">&times;</span>
      </div>

      <img class="modal-content" id="modal-img">
    </div>
  `;

  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const feed = root.querySelector('.homepage-feed');
  const threadsSidebarContainer = root.querySelector('.threads-sidebar');
  
  // Setup click handlers for threads
  if (threadsSidebarContainer && threadsSidebar.setupClickHandlers) {
    threadsSidebar.setupClickHandlers(threadsSidebarContainer);
  }
  
  let currentOffset = 0;
  const limit = 7;


  // Initial load
  await loadPosts(feed, token, limit, currentOffset, false);

  // Real-time: when user creates a post, prepend it to the feed without reload
  const onNewPostCreated = (e) => {
    const newPost = e.detail?.post;
    if (newPost && feed && feed.isConnected) prependSinglePost(newPost, token, feed);
  };
  window.addEventListener('new-post-created', onNewPostCreated);

  // Infinite scroll
  window.addEventListener('scroll', async () => {
    if (isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) { // Near bottom
      currentOffset += limit;
      await loadPosts(feed, token, limit, currentOffset, true);
    }
  });
}

// LOAD POSTS FUNCTION FOR INFINITE SCROLLING
async function loadPosts(feed, token, limit, offset, append = false) {
  if (isLoading) return;
  isLoading = true;

  try {
    const posts = await fetchrandomposts(token, limit, offset);

    if (posts.length > 0) {
      // Fetch all stats (likes, comments, and reposts) for ranking
      const postsWithStats = await Promise.all(
        posts.map(async (post) => {
          try {
            const [likeCount, commentCount, repostCount] = await Promise.all([
              fetchLikedcounts(post.post_id, token),
              fetchCommentCounts(post.post_id, token),
              fetchRepostCounts(post.post_id, token)
            ]);
            
            return { 
              ...post, 
              likeCount,
              commentCount,
              repostCount,
              timestamp: new Date(post.created_at).getTime()
            };
          } catch (error) {
            console.error('Error fetching post stats:', error);
            return { 
              ...post, 
              likeCount: 0, 
              commentCount: 0,
              repostCount: 0,
              timestamp: new Date(post.created_at).getTime()
            };
          }
        })
      );

      // Sort posts by rank: 1) Latest, 2) Likes, 3) Comments
      const sortedPosts = sortPostsByRank(postsWithStats);
      await renderPosts(sortedPosts, token, feed, append);
    } else if (!append) {
      feed.innerHTML = '<p>No posts available.</p>';
    }
  } catch (error) {
    if (!append) {
      alert("Error fetching posts: " + error.message);
    }
  } finally {
    isLoading = false;
  }
}

// FETCH REPOST COUNTS
async function fetchRepostCounts(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/posts/repost/count/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repost count: ${response.status}`);
    }
    
    const data = await response.json();
    return data.repostCount || 0;
  } catch (error) {
    console.warn('Error fetching repost count:', error.message);
    return 0;
  }
}

// FETCH COMMENT COUNTS
async function fetchCommentCounts(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/posts/comments/count/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comment count: ${response.status}`);
    }
    
    const data = await response.json();
    return data.commentCount || data.count || 0;
  } catch (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }
}

// SORT POSTS: Newest first in homepage feed
function sortPostsByRank(posts) {
  return posts.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Newest first
  });
}

// Build HTML for a single post (shared by renderPosts and prependSinglePost)
function buildPostCardHtml(post, { postCreationTime, isLiked, isCommented, likeCount, commentCount, repostCount }) {
  const imageHtml = post.img_url
    ? `<img src="${post.img_url}" data-full="${post.img_url}" alt="Post Image" class="post-image" />`
    : '';

  const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? [].concat(post.tags) : []);
  const tagsHtml = tags.length > 0
    ? `<div class="post-tags">${tags.join(', ')}</div>`
    : '';

  const displayContent =
    post.content && String(post.content).trim() !== ''
      ? post.content
      : (tags.length > 0 ? tags.join(' ') : 'No content available');

  return `
    <div class="post-card" data-post-id="${post.post_id}">
      <div class="post-meta1">
        <a href="#" class="profile-link" data-user-id="${post.user_id}">
          <img src="${post.profile_picture || '/circle-user.png'}" class="profile-picture" onerror="this.src='/circle-user.png';">
        </a>
        <a href="#" class="profile-link" data-user-id="${post.user_id}">
          <span class="post-fullname">${post.fullname || 'You'}</span>
        </a>
        <span class="post-time">${postCreationTime}</span>
      </div>

      <div class="post-content">${displayContent}</div>
      ${tagsHtml}
      ${imageHtml}

      <div class="post-actions">
        <button class="post-action like-button ${isLiked ? 'liked' : ''}"
                data-post-id="${post.post_id}"
                data-like-type="post">
          <span class="material-icons ${isLiked ? 'liked' : ''}">
            ${isLiked ? 'favorite' : 'favorite_border'}
          </span>
          <span class="like-count">${likeCount}</span>
        </button>

        <button class="post-action comment-button ${isCommented ? 'commented' : ''}" data-post-id="${post.post_id}">
          <span class="material-icons">${isCommented ? 'chat_bubble' : 'chat_bubble_outline'}</span>
          <span class="comment-count">${commentCount}</span>
        </button>

        <button class="post-action repostbtn" data-post-id="${post.post_id}">
          <span class="material-icons">repeat</span>
          <span class="repost-count">${repostCount}</span>
        </button>
      </div>
    </div>
  `;
}

// Prepend a single new post to the feed (real-time, no reload)
function prependSinglePost(newPost, token, feed) {
  const post = {
    ...newPost,
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
    tags: Array.isArray(newPost.tags) ? newPost.tags : (newPost.tags ? [].concat(newPost.tags) : []),
  };
  const postCreationTime = formatDate(post.created_at);
  const html = buildPostCardHtml(post, {
    postCreationTime,
    isLiked: false,
    isCommented: false,
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
  });
  feed.insertAdjacentHTML('afterbegin', html);
  const firstCard = feed.querySelector('.post-card');
  if (firstCard) attachPostActions(feed, token, firstCard);
  attachLocalImageModal();
}

// RENDER POSTS FUNCTION
async function renderPosts(posts, token, feed, append = false) {
  if (!append) {
    feed.innerHTML = '';
  }

  try {
    // Fetch like and comment status for each post
    const likeStatusPromises = posts.map(post => fetchIsLikedStatus(post.post_id, token));
    const commentStatusPromises = posts.map(post => fetchIsCommentedStatus(post.post_id, token));
    const [likeStatuses, commentStatuses] = await Promise.all([
      Promise.all(likeStatusPromises),
      Promise.all(commentStatusPromises)
    ]);

    posts.forEach((post, index) => {
      const postCreationTime = formatDate(post.created_at);
      const isLiked = likeStatuses[index];
      const isCommented = commentStatuses[index];
      const likeCount = post.likeCount || 0;
      const commentCount = post.commentCount || 0;
      const repostCount = post.repostCount || 0;

      const postContent = buildPostCardHtml(post, {
        postCreationTime,
        isLiked,
        isCommented,
        likeCount,
        commentCount,
        repostCount,
      });

      if (append) {
        feed.insertAdjacentHTML('beforeend', postContent);
      } else {
        feed.innerHTML += postContent;
      }
    });

    // Attach Like, Repost, Comment, and Profile link events
    attachPostActions(feed, token);

    // FIXED LOCAL MODAL
    attachLocalImageModal();

  } catch (error) {
    alert("Error rendering posts: " + error.message);
  }
}

// REFRESH POST COUNTS FUNCTION
async function refreshPostCounts(postId, token) {
  try {
    const [likeCount, commentCount, repostCount] = await Promise.all([
      fetchLikedcounts(postId, token),
      fetchCommentCounts(postId, token),
      fetchRepostCounts(postId, token)
    ]);
    
    // Find and update the post in the DOM
    const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    
    if (postElement) {
      const likeCountEl = postElement.querySelector('.like-count');
      const commentCountEl = postElement.querySelector('.comment-count');
      const repostCountEl = postElement.querySelector('.repost-count');
      
      if (likeCountEl) likeCountEl.textContent = likeCount;
      if (commentCountEl) commentCountEl.textContent = commentCount;
      if (repostCountEl) repostCountEl.textContent = repostCount;
    }
    
    return { likeCount, commentCount, repostCount };
  } catch (error) {
    console.error('Error refreshing post counts:', error);
  }
}

// POST ACTIONS (like, repost, comment, profile). If scope is provided, only attach to that card.
function attachPostActions(feed, token, scope = null) {
  const root = scope || feed;
  // Like
  root.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.getAttribute('data-post-id');
      const likeType = button.getAttribute('data-like-type');
      try {
        const likeCountElement = button.querySelector('.like-count');
        const likeIcon = button.querySelector('.material-icons');
        
        // Determine current state
        const currentlyLiked =
          button.classList.contains('liked') ||
          likeIcon.textContent.trim() === 'favorite';
        const nextLiked = !currentlyLiked;

        // Optimistic UI update: update icon immediately
        button.classList.toggle('liked', nextLiked);
        likeIcon.classList.toggle('liked', nextLiked);
        likeIcon.textContent = nextLiked ? 'favorite' : 'favorite_border';

        const updatedLikeData = await toggleLike(postId, token, likeType);

        // Use server only for counts; keep UI toggle as decided above
        if (updatedLikeData && typeof updatedLikeData.likes !== 'undefined') {
          likeCountElement.textContent = updatedLikeData.likes;
        }
        
        // Also update the post's stored counts for ranking if needed
        await refreshPostCounts(postId, token);
      } catch (error) {
        alert("Error updating like: " + error.message);
      }
    });
  });

  // Repost - UPDATED WITH BETTER ERROR HANDLING
  root.querySelectorAll('.repostbtn').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.getAttribute('data-post-id');
      const repostCountEl = button.querySelector('.repost-count');
      
      try {
        // First, check if user has already reposted
        const hasReposted = await checkIfUserReposted(postId, token);
        
        if (hasReposted) {
          // Option 1: If already reposted, you could allow "undo repost"
          // Option 2: Just show a message
          alert('You have already reposted this post.');
          return;
        }
        
        // Perform the repost
        const repostResult = await repost(postId, token);
        
        // Always refresh the counts to get the updated repost count
        await refreshPostCounts(postId, token);
        
        // Visual feedback
        button.classList.add('reposted');
        button.style.color = '#e75480';
        setTimeout(() => button.classList.remove('reposted'), 300);
        
        alert('Post reposted successfully!');
        
      } catch (error) {
        console.error('Repost failed:', error);
        alert("Failed to repost: " + error.message);
      }
    });
  });

  // Comment
  root.querySelectorAll('.comment-button').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.getAttribute('data-post-id');
      const onCommentSubmitted = async () => {
        // Refresh comment count after comment is submitted
        await refreshPostCounts(postId, token);
        
        // Update the comment button to show commented state
        const commentIcon = button.querySelector('.material-icons');
        commentIcon.textContent = 'chat_bubble';
        button.classList.add('commented');
      };
      createCommentModal(postId, onCommentSubmitted);
    });
  });

  // Profile link
  root.querySelectorAll('.profile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const userId = link.getAttribute('data-user-id');
      localStorage.setItem('selectedUserId', userId);
      window.history.pushState({}, '', `/bini/others-profile`);
      window.dispatchEvent(new Event('popstate'));
    });
  });
}

// CHECK IF USER HAS ALREADY REPOSTED - SIMPLIFIED
async function checkIfUserReposted(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/posts/${postId}/repost`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const userReposts = await response.json();
      if (Array.isArray(userReposts)) {
        const hasReposted = userReposts.some(repost => 
          repost.post_id === postId || 
          repost.original_post_id === postId ||
          repost.id === postId
        );
        return hasReposted;
      }
    }
    
    // If check fails, assume not reposted
    return false;
  } catch (error) {
    console.warn('Error checking repost status:', error);
    return false;
  }
}

// FIXED LOCAL IMAGE MODAL WITH DOWNLOAD FUNCTIONALITY
function attachLocalImageModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.modal-close');
  const downloadBtn = document.getElementById('download-btn');

  // Zoom buttons
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");

  let currentImageUrl = '';
  let scale = 1; // zoom level

  // Image click
  document.querySelectorAll('.post-image').forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      currentImageUrl = img.dataset.full || img.src;
      modalImg.src = currentImageUrl;

      // Reset zoom every time an image opens
      scale = 1;
      modalImg.style.transform = "scale(1)";
    });
  });

  // ZOOM IN
  zoomInBtn.addEventListener("click", () => {
    scale += 0.2;
    modalImg.style.transform = `scale(${scale})`;
  });

  // ZOOM OUT
  zoomOutBtn.addEventListener("click", () => {
    if (scale > 0.4) scale -= 0.2;
    modalImg.style.transform = `scale(${scale})`;
  });

  // Download button
  downloadBtn.addEventListener('click', async () => {
    if (currentImageUrl) {
      await downloadImage(currentImageUrl);
    }
  });

  // Close X
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modalImg.src = '';
    currentImageUrl = '';
    scale = 1;
    modalImg.style.transform = "scale(1)";
  });

  // Close by clicking outside modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      modalImg.src = '';
      currentImageUrl = '';
      scale = 1;
      modalImg.style.transform = "scale(1)";
    }
  });
}

// DOWNLOAD IMAGE FUNCTION
async function downloadImage(imageUrl) {
  try {
    const downloadUrl = convertToDownloadableUrl(imageUrl);
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = getFilenameFromUrl(imageUrl) || `image-${Date.now()}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

  } catch (error) {
    console.error('Download failed:', error);
    fallbackDownload(imageUrl);
  }
}

// CONVERT CLOUDINARY URL TO DIRECT DOWNLOAD
function convertToDownloadableUrl(url) {
  try {
    // If it's a Cloudinary URL, add download parameter
    if (url.includes('cloudinary.com')) {
      // Remove any existing download parameters and add fl_attachment
      const urlObj = new URL(url);
      
      // Add download parameter - method 1: add fl_attachment
      if (!urlObj.pathname.includes('/fl_attachment/')) {
        const pathParts = urlObj.pathname.split('/');
        const uploadIndex = pathParts.findIndex(part => part === 'upload');
        
        if (uploadIndex !== -1 && pathParts.length > uploadIndex + 1) {
          // Insert fl_attachment after upload
          pathParts.splice(uploadIndex + 1, 0, 'fl_attachment');
          urlObj.pathname = pathParts.join('/');
        }
      }
      
      return urlObj.toString();
    }
    
    // For non-Cloudinary URLs, return as is
    return url;
  } catch (e) {
    // If URL parsing fails, return original URL
    return url;
  }
}

// ALTERNATIVE CLOUDINARY DOWNLOAD METHOD
function convertCloudinaryUrl(url) {
  try {
    if (url.includes('cloudinary.com')) {
      const urlObj = new URL(url);
      
      // Method 2: Add download parameter as query
      urlObj.searchParams.set('_a', 'AVAJpyaS'); // This triggers download in some cases
      
      return urlObj.toString();
    }
    return url;
  } catch (e) {
    return url;
  }
}

// FALLBACK DOWNLOAD METHOD
function fallbackDownload(imageUrl) {
  try {
    const link = document.createElement('a');
    link.href = imageUrl;
    
    // Force download attribute
    const filename = getFilenameFromUrl(imageUrl) || `image-${Date.now()}.jpg`;
    link.download = filename;
    link.target = '_blank'; // Open in new tab as fallback
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show message to user
    alert('If download did not start automatically, right-click on the image and select "Save image as..."');
  } catch (error) {
    console.error('Fallback download failed:', error);
    alert('Download failed. Please try right-clicking on the image and selecting "Save image as..."');
  }
}

// EXTRACT FILENAME FROM URL - IMPROVED
function getFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract filename from path
    let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    // Remove Cloudinary version numbers if present
    filename = filename.replace(/^v\d+\//, '');
    
    // Ensure it has an extension
    if (!filename.includes('.')) {
      filename += '.jpg';
    }
    
    return filename || null;
  } catch (e) {
    // If URL parsing fails, try simple extraction
    const matches = url.match(/\/([^\/?#]+)(?:\?[^#]*)?(?:#.*)?$/);
    let filename = matches ? matches[1] : null;
    
    if (filename && !filename.includes('.')) {
      filename += '.jpg';
    }
    
    return filename;
  }
}

// FORMAT DATE FUNCTION
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

// FETCH COMMENT STATUS
async function fetchIsCommentedStatus(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/comments/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return false;
    }
    const userComments = await response.json();
    
    const hasCommented = Array.isArray(userComments) && 
      userComments.some(comment => comment.post_id === parseInt(postId));
    
    return hasCommented;
  } catch (error) {
    return false;
  }
}

// FETCH LIKE STATUS
async function fetchIsLikedStatus(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/posts/${postId}/likes/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to check like status');
    const { isLiked } = await response.json();
    return isLiked;
  } catch (_) {
    return false;
  }
}

// FETCH LIKE COUNTS (FIXED TYPO IN URL)
async function fetchLikedcounts(postId, token) {
  try {
    const response = await fetch(`${BINI_API_URL}/posts/${postId}/likes/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch like count');
    const { likeCount } = await response.json();
    return likeCount;
  } catch (_) {
    return 0;
  }
}

// TOGGLE LIKE
async function toggleLike(postId, token, likeType = 'post', commentId = null) {
  const url = `${BINI_API_URL}/posts/${postId}/likes/toggle`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': 'thread',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ likeType, commentId }),
  });
  if (!response.ok) throw new Error('Failed to toggle like');
  return await response.json();
}