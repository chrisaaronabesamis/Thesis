// Centralized BINI API configuration
export const BINI_API_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';
export const BINI_API_KEY = 'thread';

export default {
  BINI_API_URL,
  BINI_API_KEY
};
