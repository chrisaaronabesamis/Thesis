// Message API configuration - uses same base URL as Bini API
import { BINI_API_URL } from './bini-api.js';

const envUrl = import.meta.env.VITE_MESSAGE_API_URL;
// Validate that the URL starts with http:// or https://, otherwise use Bini API URL
export const MESSAGE_API_URL = (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://')))
  ? envUrl
  : BINI_API_URL;

export default {
  MESSAGE_API_URL
};
