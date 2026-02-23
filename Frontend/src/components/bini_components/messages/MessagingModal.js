import { socket, setupSocket } from "../../../hooks/bini_hooks/socket";
import api from "../../../lib/api";
import { MESSAGE_API_URL } from "../../../config/message-api.js";
import "../../../styles/bini_styles/MessagingModal.css";

export default class MessagingModal {
  constructor() {
    this.modal = null;
    this.chatList = null;
    this.chatFooter = null;
    this.currentChatUserId = null;
    this.currentUserId = null;
    this.currentUserProfilePic = null;
    this.onlineUsers = new Set();
  this.socket = socket || setupSocket();
    this.avatarCache = new Map();
    this.miniWindows = [];
    this.miniWidth = 350;
    this.miniGap = 10;
    // Add tabs state
    this.activeTab = "all"; // "all", "following", "followers"

    // Only wire handlers if a socket-like object with event methods exists
    if (this.socket && typeof this.socket.on === "function") {
      this.setupSocketHandlers();
    } else {
      console.warn("MessagingModal: socket not available, skipping socket handlers");
    }
  }

  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mon";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " m";
    return "Just now";
  }

  // socket handlers
  setupSocketHandlers() {
    if (!this.socket || typeof this.socket.off !== "function") return;

    this.socket.off("receive_message");
    this.socket.off("show_typing");
    this.socket.off("hide_typing");

    this.socket.on("receive_message", (message) => {
      const isCurrentChat =
        String(message.sender_id) === String(this.currentChatUserId);

      // mini window append - check both sender and recipient
      const mini = this.miniWindows.find(
        (m) => String(m.userId) === String(message.sender_id) || 
               String(m.userId) === String(message.receiver_id),
      );
      if (mini) {
        // Determine if message is received (from other user) or sent (by current user)
        const isReceived = String(message.sender_id) !== String(this.currentUserId);
        this.appendMiniMessage(message, isReceived, mini.userId);
      }

      // Real-time reorder + unread update
      const senderRow = this.chatList.querySelector(
        `.chat-user[data-user-id="${message.sender_id}"]`,
      );
      if (senderRow) {
        // Update preview & timestamp directly on the real row
        const previewEl = senderRow.querySelector(".chat-preview");
        const timeEl = senderRow.querySelector('div[style*="font-size:11px"]');
        const timeAgo = this.timeAgo(message.created_at || new Date());

        if (previewEl) {
          const prefix =
            String(message.sender_id) === String(this.currentUserId)
              ? "You: "
              : "";
          previewEl.innerHTML = `${prefix}${message.content}`;
        }
        if (timeEl) {
          timeEl.innerHTML = `${timeAgo}<span class="unread-dot-inline"></span>`;
        }

        // Re-order: move the real row to the top
        senderRow.remove();
        this.chatList.prepend(senderRow);
      }

      if (!isCurrentChat) {
        const row = this.chatList.querySelector(
          `.chat-user[data-user-id="${message.sender_id}"]`,
        );
        if (!row) return;
        row.classList.add("unread");

        let badge = row.querySelector(".unread-badge");
        if (badge) badge.remove();

        const timeEl = row.querySelector(".chat-user-time");
        if (timeEl && !timeEl.querySelector(".unread-dot-inline")) {
          const dot = document.createElement("span");
          dot.className = "unread-dot-inline";
          timeEl.appendChild(dot);
        }
      }

      if (
        isCurrentChat ||
        String(message.recipient_id) === String(this.currentChatUserId)
      ) {
        this.appendMessage(message, message.sender_id !== this.currentUserId);
        this.scrollToBottom();
      }
    });

    this.socket.on("show_typing", ({ from }) => {
      if (String(from) === String(this.currentChatUserId)) {
        const indicator = this.modal?.querySelector("#typingIndicator");
        if (indicator) indicator.style.display = "flex";
      }

      // mini windows
      this.miniWindows.forEach((m) => {
        if (String(m.userId) === String(from)) {
          const ind = m.el.querySelector(".mini-typing-indicator");
          if (ind) {
            ind.style.display = "flex";
            void ind.offsetHeight;
            ind.style.opacity = "1";
          }
          const body = m.el.querySelector(".mini-chat-body");
          if (body) body.scrollTop = body.scrollHeight;
        }
      });
    });

    this.socket.on("hide_typing", ({ from }) => {
      if (String(from) === String(this.currentChatUserId)) {
        const indicator = this.modal?.querySelector("#typingIndicator");
        if (indicator) indicator.style.display = "none";
      }

      this.miniWindows.forEach((m) => {
        if (String(m.userId) === String(from)) {
          const ind = m.el.querySelector(".mini-typing-indicator");
          if (ind) {
            ind.style.opacity = "0";
            setTimeout(() => {
              if (ind.style.opacity === "0") ind.style.display = "none";
            }, 300);
          }
        }
      });
    });

    this.socket.on("unread_count_update", ({ unread_count }) => {
      if (typeof updateNavMessageBadge === "function") {
        updateNavMessageBadge(unread_count); // global func sa navigation.js
      }
    });
  }

  /*MAIN MODAL*/
  async show() {
    const oldModal = document.getElementById("messaging-modal");
    if (oldModal) oldModal.remove();

    this.modal = document.createElement("div");
    this.modal.id = "messaging-modal";
    this.modal.innerHTML = `
      <div id="messagingHeader">
        <span class="messaging-title">Messages</span>
        <button id="closeMessagingModal" class="close-button">&times;</button>
      </div>
      
      <!-- Tabs for filtering -->
      <div class="message-tabs">
        <button class="message-tab active" data-tab="all">All</button>
        <button class="message-tab" data-tab="following">Following</button>
        <button class="message-tab" data-tab="followers">Followers</button>
      </div>
      
      <!-- Chat List -->
      <div id="chatList">
        <div class="loading-state">Loading conversations...</div>
      </div>
      <div id="chatContainer">
        <div id="messagesContainer"></div>
        <div class="message-form">
          <form id="messageForm">
            <input type="text" id="messageInput" class="message-input" placeholder="Type a message..." autocomplete="off">
            <button type="submit" class="send-button">➤</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);
    this.chatList = this.modal.querySelector("#chatList");
    this.chatFooter = this.modal.querySelector("#chatContainer");

    this.setupEventListeners();
    await this.loadCurrentUser();

    // Setup tab click handlers
    const tabs = this.modal.querySelectorAll(".message-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update active tab
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeTab = tab.dataset.tab;
        this.loadChatList(); // Reload chat list with new filter
      });
    });

    // Ensure socket is set up and connected
    if (!this.socket) {
      this.socket = setupSocket() || window.socket;
    }

    if (this.socket) {
      if (!this.socket.connected) {
        console.log("Socket not connected, connecting now...");
        this.socket.connect();
        // Wait a bit for connection, then request online users
        setTimeout(() => {
          if (this.socket?.connected) {
            this.socket.emit("request_online_users");
          }
        }, 500);
      } else {
        // Request online users list immediately if already connected
        this.socket.emit("request_online_users");
      }
    } else {
      console.warn("Socket not available, status updates may not work");
    }

    // Listen for initial online users list
    const handleOnlineUsersList = (e) => {
      const { users } = e.detail;
      console.log(`Initializing ${users.length} online users`);
      // Clear and populate the online users set
      this.onlineUsers.clear();
      users.forEach((userId) => {
        this.onlineUsers.add(String(userId));
      });
      // Update UI for all users in the chat list
      this.chatList?.querySelectorAll(".chat-user").forEach((item) => {
        const userId = String(item.dataset.userId);
        const isOnline = this.onlineUsers.has(userId);
        this.paintStatus(userId, isOnline);
      });
      // Update mini windows status
      this.miniWindows.forEach((m) => {
        const userId = String(m.userId);
        const isOnline = this.onlineUsers.has(userId);
        this.updateMiniStatus(userId, isOnline);
      });
    };

    // listen for user status updates
    const handleUserStatusUpdate = (e) => {
      const { id, status } = e.detail;
      const userId = String(id);
      if (status === "online") this.onlineUsers.add(userId);
      else this.onlineUsers.delete(userId);

      this.paintStatus(userId, status === "online");
      this.updateMiniStatus(userId, status === "online");
    };

    window.addEventListener("onlineUsersList", handleOnlineUsersList);
    window.addEventListener("userStatusUpdate", handleUserStatusUpdate);

    // Store handlers for cleanup
    this._onlineUsersListHandler = handleOnlineUsersList;
    this._userStatusUpdateHandler = handleUserStatusUpdate;

    await this.loadChatList();
  }

  async loadCurrentUser() {
    try {
      const res = await api.get("/v1/bini/users/profile");
      const user = res.data;

      this.currentUserId = user.user.user_id;
      this.currentUserProfilePic =
        user.user.profile_picture || "https://via.placeholder.com/36";
    } catch (err) {
      console.error("Error loading current user:", err);
    }
  }

  async loadChatList() {
    this.chatList.innerHTML =
      '<div class="loading-state">Loading conversations...</div>';

    try {
      // Fetch following and followers in parallel
      const [followingRes, followersRes] = await Promise.all([
        api.get("/v1/bini/follow/following"),
        api.get("/v1/bini/follow/followers"),
      ]);

      const following = followingRes.data;
      const followers = followersRes.data;

      console.log("FOLLOWING", following);
      console.log("FOLLOWERS", followers);

      // Create maps for easy lookup
      const followingIds = new Set(following.map((u) => u.user_id));
      const followersIds = new Set(followers.map((u) => u.user_id));

      // Create a map of all users with their follow relationship info
      const userMap = new Map();

      // Add following users
      following.forEach((u) => {
        const userId = u.user_id;
        if (!userMap.has(userId)) {
          u.is_online = this.onlineUsers.has(String(userId));
          u.following_status = true; // This user is being followed by current user
          u.follower_status = followersIds.has(userId); // This user follows current user
          userMap.set(userId, u);
        }
      });

      // Add followers users
      followers.forEach((u) => {
        const userId = u.user_id;
        if (userMap.has(userId)) {
          // User already exists (mutual follow), update follower status
          const existing = userMap.get(userId);
          existing.follower_status = true;
        } else {
          // New user (only follower, not following)
          u.is_online = this.onlineUsers.has(String(userId));
          u.following_status = false;
          u.follower_status = true;
          userMap.set(userId, u);
        }
      });

      let users = Array.from(userMap.values());

      console.log("ALL USERS", users);

      // Filter users based on active tab
      let filteredUsers = users;
      if (this.activeTab === "following") {
        filteredUsers = users.filter((u) => u.following_status);
      } else if (this.activeTab === "followers") {
        filteredUsers = users.filter((u) => u.follower_status);
      } else if (this.activeTab === "all") {
        // Show all users (both following and followers)
        filteredUsers = users;
      }

      // Fetch latest message previews
      const previewRes = await api.get("/v1/bini/message/preview");
      const previews = previewRes.data;

      console.log("PREVIEWS", previews);

      // Map previews by user_id
      const previewMap = {};
      previews.forEach((p) => {
        previewMap[p.user_id] = p;
      });

      // Merge preview messages into user list
      filteredUsers.forEach((u) => {
        const preview = previewMap[u.user_id];
        if (preview) {
          u.last_message = preview.last_message;
          u.sender_id = preview.sender_id;
          u.last_message_time = preview.created_at;
          u.unread_count = preview.unread_count;
        }
      });

      // Sort users: messages first by latest time, then users without messages
      filteredUsers.sort((a, b) => {
        const timeA = new Date(a.last_message_time || 0);
        const timeB = new Date(b.last_message_time || 0);
        return timeB - timeA;
      });

      // Cache avatars for quick load
      filteredUsers.forEach((u) =>
        this.avatarCache.set(
          u.user_id,
          u.profile_picture || "https://via.placeholder.com/36",
        ),
      );

      // Render the user list with previews
      this.renderUserList(filteredUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      this.chatList.innerHTML =
        '<div class="error-state">Failed to load conversations.</div>';
    }

    if (typeof updateNavMessageBadge === "function") {
      updateNavMessageBadge(0);
    }
  }

  renderUserList(users) {
    if (!this.chatList) return;

    console.log("RENDERING USERS", users);

    if (!users || users.length === 0) {
      this.chatList.innerHTML = `<div class="no-conversations">No ${this.activeTab === "all" ? "" : this.activeTab} conversations yet</div>`;
      return;
    }

    this.chatList.innerHTML = users
      ?.map((u) => {
        const timeAgo = u.last_message_time
          ? this.timeAgo(u.last_message_time)
          : "";
        const unread = Number(u.unread_count) || 0;
        const isUnread = unread > 0;

        // Add follow relationship indicator
        let followBadge = "";
        if (u.following_status && u.follower_status) {
          followBadge = '<span class="follow-badge mutual">Mutual</span>';
        } else if (u.following_status) {
          followBadge = '<span class="follow-badge following">Following</span>';
        } else if (u.follower_status) {
          followBadge =
            '<span class="follow-badge follower">Follows you</span>';
        }

        return `
        <div class="chat-user ${isUnread ? "unread" : ""}"
             data-user-id="${u.user_id}"
             data-user-name="${u.fullname || u.username || 'User'}"
             data-user-avatar="${encodeURIComponent(u.profile_picture || "https://via.placeholder.com/36")}">

          <!-- Avatar + online dot + unread dot -->
          <div class="chat-user-avatar-container">
            <img src="${u.profile_picture || "https://via.placeholder.com/36"}"
                 alt="${u.username}"
                 class="chat-user-avatar">
            <span class="online-dot" style="background:${u.is_online ? "#4CAF50" : "#ccc"};"></span>
            ${isUnread ? `<span class="unread-dot"></span>` : ""}
          </div>

          <!-- Name + Preview + Time -->
          <div class="chat-user-info">
            <div class="chat-user-name-row">
              <div class="chat-user-name">
                ${u.fullname || u.username}
              </div>
              ${followBadge}
            </div>
            <div class="chat-user-preview-row">
              <div class="chat-preview">
                ${u.last_message ? (String(u.sender_id) === String(this.currentUserId) ? "You: " : "") + u.last_message : ""}
              </div>
              <div class="chat-user-time">
                ${timeAgo}
                ${isUnread ? '<span class="unread-dot-inline"></span>' : ""}
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // Click handler + mark-as-read
    this.chatList.querySelectorAll(".chat-user").forEach((item) => {
      item.addEventListener("click", async () => {
        const userId = item.dataset.userId;
        const userName = item.dataset.userName;
        const userAvatar = item.dataset.userAvatar;

        if (item.classList.contains("unread")) {
          const token = localStorage.getItem("authToken");
          await fetch(`${MESSAGE_API_URL}/message/read/${userId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}`, apikey: "thread" },
          });

          // Real-time UI update
          item.classList.remove("unread");
          item.querySelector(".unread-dot")?.remove();
          const timeEl = item.querySelector(".chat-user-time");
          if (timeEl) {
            const dot = timeEl.querySelector(".unread-dot-inline");
            if (dot) dot.remove();
          }
        }

        this.createMiniChatWindow(userId, userName, userAvatar);
      });
    });
  }

  /*MINI CHAT WINDOWS*/
  createMiniChatWindow(userId, userName, userAvatar) {
    userId = String(userId);
    
    // If userName is not provided, try to get it from the chat list item
    if (!userName || userName === 'undefined') {
      const listItem = document.querySelector(
        `.chat-user[data-user-id="${userId}"]`,
      );
      if (listItem) {
        userName = listItem.dataset.userName || 'User';
        userAvatar = listItem.dataset.userAvatar || userAvatar;
      } else {
        userName = userName || 'User';
      }
    }
    
    setTimeout(() => {
      const listItem = document.querySelector(
        `.chat-user[data-user-id="${userId}"]`,
      );
      if (listItem) {
        listItem.classList.remove("unread");
        listItem.style.backgroundColor = "transparent";
        listItem.style.fontWeight = "normal";
        const preview = listItem.querySelector(".chat-preview");
        if (preview) {
          preview.style.fontWeight = "normal";
          preview.style.color = "#65676B";
        }
        listItem.querySelector(".unread-dot-inline")?.remove();
      }
    }, 0);

    // Mark as read in backend
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch(`${MESSAGE_API_URL}/message/read/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, apikey: "thread" },
      });
    }

    const existing = this.miniWindows.find((m) => String(m.userId) === userId);
    if (existing) {
      this.miniWindows = this.miniWindows.filter((m) => m !== existing);
      this.miniWindows.unshift(existing);
      this.repositionMiniWindows();
      return;
    }

    const decodedAvatar = decodeURIComponent(
      userAvatar || "https://via.placeholder.com/36",
    );

    const mini = document.createElement("div");
    mini.className = "mini-chat-window";
    mini.dataset.userId = userId;
    mini.style.width = `${this.miniWidth}px`;
    mini.style.right = `20px`;

    mini.innerHTML = `
    <div class="mini-chat-header">
      <div class="mini-chat-header-content">
        <div class="mini-chat-avatar-container">
          <img src="${decodedAvatar}" alt="${userName}" class="mini-chat-avatar">
          <span class="mini-online-dot" style="background:${this.onlineUsers.has(userId) ? "#4CAF50" : "#ccc"};"></span>
        </div>
        <div class="mini-chat-user-info">
          <span class="mini-username">${userName}</span>
          <span class="mini-user-status" data-user-id="${userId}">
            ${this.onlineUsers.has(userId) ? "🟢 Active now" : "⚪ Offline"}
          </span>
        </div>
      </div>
      <button class="mini-chat-close" title="Close">&times;</button>
    </div>

    <div class="mini-chat-body" id="miniChatMessages-${userId}">
      <div class="mini-loading">Loading...</div>
      <div class="mini-typing-indicator" style="display: none;">
        <img src="${decodedAvatar}" class="typing-avatar" alt="typing">
        <div class="typing-bubble">
          <span class="typing-dot-inline"></span>
          <span class="typing-dot-inline typing-dot-delay-1"></span>
          <span class="typing-dot-inline typing-dot-delay-2"></span>
        </div>
      </div>
    </div>

    <div class="mini-chat-footer">
      <input type="text" class="mini-input" placeholder="Type a message..." autocomplete="off" />
      <button class="mini-send">➤</button>
    </div>
  `;

    document.body.appendChild(mini);
    this.miniWindows.unshift({ userId, el: mini });
    this.repositionMiniWindows();

    // Close button
    mini.querySelector(".mini-chat-close").addEventListener("click", () => {
      this.closeMiniWindow(userId);
    });

    // Input & send handlers
    const input = mini.querySelector(".mini-input");
    const sendBtn = mini.querySelector(".mini-send");
    let typingTimeout;

    input.addEventListener("input", () => {
      if (!this.socket?.connected) return;
      this.socket.emit("typing", { to: userId });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        this.socket.emit("stop_typing", { to: userId });
      }, 1000);
    });

    sendBtn.addEventListener("click", async () => {
      const content = input.value.trim();
      if (!content) return;
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${MESSAGE_API_URL}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: "thread",
          },
          body: JSON.stringify({ receiver_id: userId, content }),
        });
        if (res.ok) {
          const result = await res.json();
          const msgData = result.data || result;
          
          // Ensure message has required fields
          const messageToAppend = {
            ...msgData,
            created_at: msgData.created_at || msgData.timestamp || new Date().toISOString(),
            sender_id: msgData.sender_id || this.currentUserId,
            receiver_id: msgData.receiver_id || userId,
            content: msgData.content
          };
          
          input.value = "";
          this.socket.emit("stop_typing", { to: userId });
          
          // Reload messages from API - guarantees message shows (avoids race with loadMiniMessages)
          await this.loadMiniMessages(userId);
          
          if (this.socket?.connected)
            this.socket.emit("send_message", messageToAppend);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error("Failed to send message:", res.status, errorData);
          alert("Failed to send message: " + (errorData.error || "Please try again"));
        }
      } catch (err) {
        console.error("Error sending mini message:", err);
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    this.loadMiniMessages(userId);
  }

  repositionMiniWindows() {
    this.miniWindows.forEach((m, index) => {
      const right = 20 + index * (this.miniWidth + this.miniGap);
      m.el.style.right = `${right}px`;
      m.el.style.zIndex = String(12000 + (this.miniWindows.length - index));
    });
  }

  closeMiniWindow(userId) {
    userId = String(userId);
    const idx = this.miniWindows.findIndex((m) => String(m.userId) === userId);
    if (idx === -1) return;
    const removed = this.miniWindows.splice(idx, 1)[0];
    if (removed?.el) removed.el.remove();
    this.repositionMiniWindows();
  }

  updateMiniStatus(userId, isOnline) {
    this.miniWindows.forEach((m) => {
      if (String(m.userId) === String(userId)) {
        const dot = m.el.querySelector(".mini-online-dot");
        const status = m.el.querySelector(".mini-user-status");
        if (dot) dot.style.background = isOnline ? "#4CAF50" : "#ccc";
        if (status)
          status.textContent = isOnline ? "🟢 Active now" : "⚪ Offline";
      }
    });
  }

  async loadMiniMessages(userId) {
    userId = String(userId);
    const container = document.querySelector(`#miniChatMessages-${userId}`);
    if (!container) {
      console.warn(`Container #miniChatMessages-${userId} not found`);
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="mini-loading">Loading...</div>';

    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${MESSAGE_API_URL}/message/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, apikey: "thread" },
      });
      
      if (res.ok) {
        const messages = await res.json();
        console.log(`Loaded ${messages?.length || 0} messages for user ${userId}:`, messages);
        
        // Clear container completely
        container.innerHTML = "";

        if (Array.isArray(messages) && messages.length > 0) {
          // Add all messages
          messages.forEach((m) => {
            const isReceived = String(m.sender_id) !== String(this.currentUserId);
            console.log(`Appending message:`, { content: m.content, isReceived, sender_id: m.sender_id, currentUserId: this.currentUserId });
            this.appendMiniMessage(m, isReceived, userId);
          });
        } else {
          // Show empty state
          const emptyMsg = document.createElement("div");
          emptyMsg.className = "mini-loading";
          emptyMsg.style.cssText = "text-align:center;padding:1rem;color:#999;";
          emptyMsg.textContent = "No messages yet";
          container.appendChild(emptyMsg);
        }
        
        // Re-add typing indicator (it's part of the template, recreate it)
        const typingIndicator = document.createElement("div");
        typingIndicator.className = "mini-typing-indicator";
        typingIndicator.style.cssText = "display: none;";
        const miniWindow = container.closest(".mini-chat-window");
        if (miniWindow) {
          const decodedAvatar = miniWindow.querySelector(".mini-chat-avatar")?.src || "https://via.placeholder.com/36";
          typingIndicator.innerHTML = `
            <img src="${decodedAvatar}" class="typing-avatar" alt="typing">
            <div class="typing-bubble">
              <span class="typing-dot-inline"></span>
              <span class="typing-dot-inline typing-dot-delay-1"></span>
              <span class="typing-dot-inline typing-dot-delay-2"></span>
            </div>
          `;
        }
        container.appendChild(typingIndicator);
        
        container.scrollTop = container.scrollHeight;
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to load messages:", res.status, errorData);
        container.innerHTML = '<div class="error-loading">Failed to load messages</div>';
      }
    } catch (err) {
      console.error("Error loading mini messages:", err);
      container.innerHTML = '<div class="error-loading">Error loading messages</div>';
    }
  }

  appendMiniMessage(message, isReceived, userId) {
    userId = String(userId);
    const container = document.querySelector(`#miniChatMessages-${userId}`);
    if (!container) {
      console.warn(`Container not found for mini chat: #miniChatMessages-${userId}`);
      return;
    }
    
    if (!message || !message.content) {
      console.warn("Invalid message data:", message);
      return;
    }

    console.log(`Appending message to container:`, {
      containerExists: !!container,
      containerChildren: container.children.length,
      messageContent: message.content,
      isReceived
    });

    // Get sender's info from cache or use default
    const userAvatar =
      this.avatarCache.get(message.sender_id) ||
      "https://via.placeholder.com/36";
    const userName = message.sender_name || "User";

    // Create message container
    const messageContainer = document.createElement("div");
    messageContainer.className =
      "message-container" + (!isReceived ? " message-sent" : "");
    messageContainer.style.cssText = "display: flex; margin: 6px 0; align-items: flex-end; gap: 8px;";

    // Only show profile picture for received messages (not for current user's sent messages)
    if (isReceived) {
      const avatarImg = document.createElement("img");
      avatarImg.src = userAvatar;
      avatarImg.alt = userName;
      avatarImg.className = "message-avatar";
      avatarImg.style.cssText = "width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;";
      messageContainer.appendChild(avatarImg);
    }

    // Create message content
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.style.cssText = "display: flex; flex-direction: column; max-width: calc(100% - 40px);";

    // Create message bubble
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${isReceived ? "received" : "sent"}`;
    bubble.textContent = message.content;
    bubble.style.cssText = `
      padding: 8px 12px;
      border-radius: 18px;
      font-size: 13px;
      max-width: 200px;
      word-break: break-word;
      line-height: 1.4;
      ${isReceived ? 'background: #e5e5e5; color: #111; margin-right: auto;' : 'background: #0095f6; color: #fff; margin-left: auto;'}
    `;

    // Add timestamp
    const time = document.createElement("div");
    time.className = "message-time";
    // Handle both created_at and timestamp fields
    const messageTime = message.created_at || message.timestamp
      ? new Date(message.created_at || message.timestamp)
      : new Date();
    time.textContent = messageTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    time.style.cssText = "font-size: 10px; margin-top: 4px; line-height: 1.2;";

    bubble.appendChild(time);
    messageContent.appendChild(bubble);
    messageContainer.appendChild(messageContent);

    // Insert the message before the typing indicator if it exists
    const typingIndicator = container.querySelector(".mini-typing-indicator");
    if (typingIndicator) {
      container.insertBefore(messageContainer, typingIndicator);
    } else {
      container.appendChild(messageContainer);
    }

    console.log(`Message appended. Container now has ${container.children.length} children`);
    container.scrollTop = container.scrollHeight;
  }

  /* MAIN MODAL MESSAGE APPEND*/
  appendMessage(message, isReceived) {
    const messagesContainer = this.modal.querySelector("#messagesContainer");
    const date = message.created_at ? new Date(message.created_at) : new Date();
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let profilePic = isReceived
      ? this.avatarCache.get(message.sender_id)
      : this.currentUserProfilePic;
    if (!profilePic) profilePic = "https://via.placeholder.com/36";

    const msg = document.createElement("div");
    msg.className = `main-message-container ${isReceived ? "" : "sent"}`;

    msg.innerHTML = `
      <img src="${profilePic}" class="main-message-avatar">
      <div class="main-message-bubble ${isReceived ? "received" : "sent"}">
        <div class="main-message-content">${message.content}</div>
        <div class="main-message-time">${time}</div>
      </div>
    `;
    messagesContainer.appendChild(msg);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const messagesContainer = this.modal.querySelector("#messagesContainer");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  paintStatus(userId, isOnline) {
    const dot = document.querySelector(
      `.chat-user[data-user-id="${userId}"] .online-dot`,
    );
    if (dot) dot.style.background = isOnline ? "#4CAF50" : "#ccc";
  }

  close() {
    // Clean up socket listeners
    if (this.socket) {
      this.socket.off("receive_message");
      this.socket.off("show_typing");
      this.socket.off("hide_typing");
    }

    // Remove window event listeners
    if (this._onlineUsersListHandler) {
      window.removeEventListener(
        "onlineUsersList",
        this._onlineUsersListHandler,
      );
      this._onlineUsersListHandler = null;
    }
    if (this._userStatusUpdateHandler) {
      window.removeEventListener(
        "userStatusUpdate",
        this._userStatusUpdateHandler,
      );
      this._userStatusUpdateHandler = null;
    }

    this.miniWindows.forEach((m) => m.el.remove());
    this.miniWindows = [];
    this.modal?.remove();
    this.modal = null;
  }

  setupEventListeners() {
    // Close modal when clicking the close button
    const closeButton = this.modal?.querySelector("#closeMessagingModal");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.close());
    }

    // Message form submission
    const messageForm = this.modal?.querySelector("#messageForm");
    if (messageForm) {
      messageForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = messageForm.querySelector("#messageInput");
        const message = input.value.trim();
        if (!message || !this.currentChatUserId) return;

        const token = localStorage.getItem("authToken");
        if (!token) {
          alert("Please login first");
          return;
        }

        try {
          // Send message via API first
          const res = await fetch(`${MESSAGE_API_URL}/message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              apikey: "thread",
            },
            body: JSON.stringify({ receiver_id: this.currentChatUserId, content: message }),
          });

          if (res.ok) {
            const result = await res.json();
            const msgData = result.data || result;
            
            // Immediately append message to UI
            this.appendMessage(msgData, false);
            
            // Emit via socket for real-time updates
            if (this.socket?.connected) {
              this.socket.emit("send_message", msgData);
            }
            
            input.value = "";
            this.scrollToBottom();
          } else {
            const errorData = await res.json();
            alert("Failed to send message: " + (errorData.error || "Please try again"));
          }
        } catch (err) {
          console.error("Error sending message:", err);
          alert("Error sending message. Please check your connection.");
        }
      });
    }
  }
}
