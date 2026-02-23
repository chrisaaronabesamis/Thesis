import { io } from "socket.io-client";

const API_URL = `http://localhost:4000`;

let socket = null;
let isSetup = false;

// noop socket used when user is unauthenticated so callers can safely call
// on/off/emit without checking for null. When auth becomes available,
// setupSocket() will replace the noop with a real socket instance.
const noopSocket = {
  isNoop: true,
  connected: false,
  auth: {},
  on: () => {},
  off: () => {},
  emit: () => {},
  connect: () => {},
  disconnect: () => {},
};

const setupSocket = () => {
  const currentToken = localStorage.getItem("authToken");
  const userId =
    localStorage.getItem("selectedUserId") ||
    localStorage.getItem("currentUserId");

  if (!currentToken || !userId) {
    console.warn("⚠️ No token or userId found, skipping socket init");
    // Disconnect if socket exists but no auth
    if (socket?.connected) {
      socket.disconnect();
    }
    // return a noop socket so callers can safely call socket.on/off/emit
    socket = noopSocket;
    window.socket = socket;
    isSetup = false;
    return socket;
  }

  // Create socket if it doesn't exist or if the existing socket is a noop
  if (!socket || socket.isNoop) {
    socket = io(API_URL, {
      auth: { token: currentToken },
      autoConnect: true, // Auto-connect when created
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
  } else {
    // Update auth token if socket exists but token changed
    socket.auth.token = currentToken;
  }

  // Remove old listeners to prevent duplicates
  socket.off("connect");
  socket.off("connect_error");
  socket.off("online_users_list");
  socket.off("user_status");
  socket.off("disconnect");

  // Set up event listeners
  socket.on("connect", () => {
    console.log("🔗 Connected to WebSocket server");
    const currentUserId =
      localStorage.getItem("userId") || localStorage.getItem("currentUserId");
    if (currentUserId) {
      socket.emit("join_room", currentUserId);
      // Request online users list if we just connected
      socket.emit("request_online_users");
    }
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  // Receive initial list of online users when connecting
  socket.on("online_users_list", ({ users }) => {
    console.log(`Received ${users.length} online users`);
    window.dispatchEvent(
      new CustomEvent("onlineUsersList", { detail: { users } }),
    );
  });

  socket.on("user_status", ({ id, status }) => {
    console.log(`🟢 User ${id} is now ${status}`);
    window.dispatchEvent(
      new CustomEvent("userStatusUpdate", { detail: { id, status } }),
    );
  });

  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }

  window.socket = socket;
  isSetup = true;

  return socket;
};

// Auto-setup on module load if authenticated
if (localStorage.getItem("authToken")) {
  setupSocket();
}

export { socket, setupSocket };
