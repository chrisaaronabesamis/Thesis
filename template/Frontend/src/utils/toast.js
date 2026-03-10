const listeners = new Set();

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitToast(payload) {
  listeners.forEach((listener) => listener(payload));
}

function push(message, type = "info", duration = 2800) {
  emitToast({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: String(message || "").trim(),
    type,
    duration,
  });
}

export const toast = {
  info(message, duration) {
    push(message, "info", duration);
  },
  success(message, duration) {
    push(message, "success", duration);
  },
  warning(message, duration) {
    push(message, "warning", duration);
  },
  error(message, duration) {
    push(message, "error", duration);
  },
};

