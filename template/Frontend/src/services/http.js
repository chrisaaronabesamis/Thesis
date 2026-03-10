import axios from "axios";
import { getSiteSlug, getToken } from "../utils/storage";

function createClient(baseURL) {
  const client = axios.create({ baseURL, timeout: 15000 });

  client.interceptors.request.use((config) => {
    const token = getToken();
    const siteSlug = getSiteSlug();

    config.headers = config.headers || {};
    config.headers.apikey = import.meta.env.VITE_API_KEY || "thread";
    config.headers["x-site-slug"] = siteSlug;
    config.headers["x-community-type"] = siteSlug;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return client;
}

const apiBase = import.meta.env.VITE_API_URL;
const ecommerceBase = import.meta.env.VITE_ECOMMERCE_API_URL || apiBase;
const adminBase = import.meta.env.VITE_ADMIN_API_URL || apiBase;

export const biniApi = createClient(`${apiBase}/bini`);
export const ecommerceApi = createClient(`${ecommerceBase}/ecommerce`);
export const adminApi = createClient(`${adminBase}/admin`);
export const youtubeApi = createClient(`${apiBase}/youtube`);
export const coreApi = createClient(`${apiBase}`);
