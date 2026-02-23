import { fetchProfileData } from "../../../services/bini_services/user/fetchprofiledata.js";
import { repost } from "../../../services/bini_services/post/repost.js";
import createCommentModal from "../post/comment_modal.js";
import showEditProfileModal from "./edit-profile-modal.js"; // Import modal
import api from "../../../lib/api.js";

export default async function ProfileInfo(root) {
  root.innerHTML = `
    <div class="profile-container">
      <div class="profile-info">
        <img src="" alt="Profile Picture" class="profile-picture1" id="profilePicture" onerror="this.src='';">
        <div class="profile-details">
          <h2 id="fullname" style="font-family: 'Paytone One', sans-serif;">Loading...</h2>
          <button id="editProfileBtn" class="btn-editbutton">Edit Profile</button>
        </div>
      </div>
      <div class="nav-container">
        <button class="profile-nav-item" data-tab="threads">Bloomies</button>
        <button class="profile-nav-item" data-tab="reposts">Reposts</button>
      </div>
      <div class="feed"></div>
    </div>
  `;

  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Please login first.");
    return;
  }

  try {
    const user = await fetchProfileData(token);
    if (user) {
      const profilePicture = root.querySelector("#profilePicture");
      const fullname = root.querySelector("#fullname");
      profilePicture.src =
        user.profile_picture || "";
      fullname.textContent = user.fullname || "Anonymous";
      const userId = user.user_id;
      renderPosts("threads", userId, token, root.querySelector(".feed"));

      // EDIT PROFILE MODAL BUTTON LOGIC
      const editBtn = root.querySelector("#editProfileBtn");
      editBtn.addEventListener("click", () => {
        showEditProfileModal(user, token, (newFullname, newProfilePic) => {
          fullname.textContent = newFullname;
          profilePicture.src =
            newProfilePic || "";
        });
      });

      const profileNavItems = root.querySelectorAll(".profile-nav-item");
      profileNavItems.forEach((item) => {
        item.addEventListener("click", () => {
          profileNavItems.forEach((navItem) =>
            navItem.classList.remove("active"),
          );
          item.classList.add("active");
          renderPosts(
            item.dataset.tab,
            userId,
            token,
            root.querySelector(".feed"),
          );
        });
      });
    } else {
      alert("Profile data could not be fetched");
    }
  } catch (error) {
    alert("Error fetching profile data: " + error.message);
  }
}
// POSTS/REPOSTS RENDERING
async function renderPosts(tab, userId, token, feed) {
  feed.innerHTML = "";

  if (!userId) {
    alert("User ID not found.");
    return;
  }

  try {
    let posts = [];

    if (tab === "threads") {
      posts = await fetchUserPosts();
    } else if (tab === "reposts") {
      posts = await fetchUserReposts();
    }

    if (posts.length === 0) {
      feed.innerHTML = "<p>No posts available.</p>";
      return;
    }

    const likeStatusPromises = posts.map((post) =>
      fetchIsLikedStatus(post.post_id),
    );
    const likeStatuses = await Promise.all(likeStatusPromises);
    const likecountPromises = posts.map((post) =>
      fetchLikedCounts(post.post_id),
    );
    const countlike = await Promise.all(likecountPromises);

    posts.forEach((post, index) => {
      const postCreationTime = formatDate(post.created_at);
      const isLiked = likeStatuses[index];
      const likeCount = countlike[index];

      const repostFromHtml = (tab === "reposts" && post.original_user_id)
        ? `<span class="repost-from">♻️ Reposted from <a href="#" class="profile-link" data-user-id="${post.original_user_id}">${post.original_fullname || "Unknown"}</a></span>`
        : "";
      const postContent = `
        <div class="post-card" style="position:relative;">
          <div class="post-meta">
            ${repostFromHtml}
            <span class="post-time">${postCreationTime}</span>
            <div class="post-menu-container" style="display:inline-block; position:absolute; top:10px; right:10px;">
              <button class="post-menu-btn" data-post-id="${post.post_id}" style="background:none; border:none; cursor:pointer; font-size:18px;">&#8942;</button>
              <div class="post-menu-dropdown" style="display:none; position:absolute; right:0; background:white; border:1px solid #ccc; z-index:10;">
                <button class="delete-post-btn" data-post-id="${post.post_id}" style="background:none; border:none; color:red; padding:8px 16px; width:100%; text-align:left; cursor:pointer;">Delete Post</button>
              </div>
            </div>
          </div>
          <div class="post-content">${post.content || "No content available"}</div>
          <div class="post-tags">${post.tags ? post.tags.join(", ") : "No tags available"}</div>
          ${post.img_url ? `<img src="${post.img_url}" alt="Post Image" class="post-image" />` : ""}
          <div class="post-actions">
            <button class="post-action like-button ${isLiked ? "liked" : ""}" data-post-id="${post.post_id}" data-like-type="post">
                <span class="material-icons ${isLiked ? "liked" : ""}">favorite_border</span>
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
      `;
      feed.innerHTML += postContent;
    });

    // Like button event
    feed.querySelectorAll(".like-button").forEach((button) => {
      button.addEventListener("click", async () => {
        const postId = button.getAttribute("data-post-id");
        const likeType = button.getAttribute("data-like-type");
        try {
          const updatedLikeData = await toggleLike(postId, likeType);
          const likeCountElement = button.querySelector(".like-count");
          const likeIcon = button.querySelector(".material-icons");
          likeCountElement.textContent = updatedLikeData.likes;
          likeIcon.classList.toggle("liked", updatedLikeData.isLiked);
          button.classList.toggle("liked", updatedLikeData.isLiked);
        } catch (error) {
          alert("Error updating like: " + error.message);
        }
      });
    });

    // Three dots menu logic
    feed.querySelectorAll(".post-menu-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        feed
          .querySelectorAll(".post-menu-dropdown")
          .forEach((drop) => (drop.style.display = "none"));
        const dropdown = btn.nextElementSibling;
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      });
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", () => {
      feed
        .querySelectorAll(".post-menu-dropdown")
        .forEach((drop) => (drop.style.display = "none"));
    });

    // Delete post logic
    feed.querySelectorAll(".delete-post-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const postId = btn.getAttribute("data-post-id");
        if (confirm("Are you sure you want to delete this post?")) {
          try {
            await deletePost(postId);
            renderPosts(tab, userId, token, feed);
          } catch (error) {
            alert("Error deleting post: " + error.message);
          }
        }
      });
    });
  } catch (error) {
    alert("Error loading posts: " + error.message);
    feed.innerHTML = "<p>Error loading posts.</p>";
  }

  // Repost button event
  feed.querySelectorAll(".repostbtn").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.getAttribute("data-post-id");
      try {
        await repost(postId, token);
      } catch (error) {
        console.error("Repost failed:", error);
      }
    });
  });

  // Profile link (e.g. "Reposted from" author)
  feed.querySelectorAll(".profile-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const userId = link.getAttribute("data-user-id");
      if (userId) {
        localStorage.setItem("selectedUserId", userId);
        window.history.pushState({}, "", "/bini/others-profile");
        window.dispatchEvent(new Event("popstate"));
      }
    });
  });

  // Comment button event
  feed.querySelectorAll(".comment-button").forEach((button) => {
    button.addEventListener("click", () => {
      const postId = button.getAttribute("data-post-id");
      try {
        createCommentModal(postId);
      } catch (error) {
        alert("Error opening comments: " + error.message);
      }
    });
  });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
// Fetch user posts
async function fetchUserPosts() {
  try {
    const res = await api.get("/v1/bini/posts/mypost");
    return res.data || [];
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to fetch posts";
    console.error("Error fetching posts:", message);
    return [];
  }
}
// Fetch user reposts
export async function fetchUserReposts() {
  try {
    const res = await api.get("/v1/bini/posts/repost");
    return res.data || [];
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch reposts";
    console.error("Error fetching reposts:", message);
    return [];
  }
}
// Toggle like function
export async function toggleLike(postId, likeType = "post", commentId = null) {
  try {
    const url = `/v1/bini/likes/toggle/${likeType}/${postId}${commentId ? `/${commentId}` : ""}`;
    const res = await api.post(url);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to toggle like";
    console.error("Error toggling like:", message);
    throw new Error(message);
  }
}
// Fetch like status
export async function fetchIsLikedStatus(postId) {
  try {
    const res = await api.get(`/v1/bini/likes/check/post/${postId}`);
    return res.data?.isLiked || false;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to check like status";
    console.error("Error checking like status:", message);
    return false;
  }
}

// Fetch like counts
export async function fetchLikedCounts(postId) {
  try {
    const res = await api.get(`/v1/bini/likes/count/post/${postId}`);
    return res.data?.likeCount || 0;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch like count";
    console.error("Error fetching like count:", message);
    return 0;
  }
}

// Delete post function
export async function deletePost(postId) {
  try {
    const res = await api.delete(`/v1/bini/posts/${postId}`);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to delete post";
    console.error("Error deleting post:", message);
    throw new Error(message);
  }
}
