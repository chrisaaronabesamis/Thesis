import { api as apiUrl } from './config.js';

function getStoredToken() {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    return null;
  }
}

// Custom fetch function that automatically includes community_type
export async function api(endpoint, options = {}) {
  const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);
  const url = isAbsoluteUrl ? endpoint : apiUrl(endpoint);


  // Prepare the request options
  const requestOptions = { ...options };

  // Add headers if not present
  if (!requestOptions.headers) {
    requestOptions.headers = {};
  }

  // Add apikey if not present
  if (!requestOptions.headers['apikey']) {
    requestOptions.headers['apikey'] = 'thread';
  }

  const token = getStoredToken();
  if (token && !requestOptions.headers['Authorization'] && !requestOptions.headers['authorization']) {
    requestOptions.headers['Authorization'] = `Bearer ${token}`;
  }


  // For POST/PUT/PATCH requests, add community_type to body if it's JSON
  if (['POST', 'PUT', 'PATCH'].includes((requestOptions.method || 'GET').toUpperCase())) {
    if (requestOptions.headers['Content-Type'] === 'application/json' || !requestOptions.headers['Content-Type']) {
      // Assume JSON body
      let body = {};
      if (requestOptions.body) {
        try {
          body = JSON.parse(requestOptions.body);
        } catch (e) {
          // If not JSON, leave as is
        }
      }
      // no community_type in body anymore
      requestOptions.body = JSON.stringify(body);
      requestOptions.headers['Content-Type'] = 'application/json';
    }
  }

  // For GET requests, add as query param
  else if ((requestOptions.method || 'GET').toUpperCase() === 'GET') {
    requestOptions.url = url;
  }

  // Debug: log full request when fetch fails (caller will still get the fetch error)
  try {
    return await fetch(requestOptions.url || url, requestOptions);
  } catch (err) {
    console.error('Fetch failed for', requestOptions.url || url, requestOptions, err);
    throw err;
  }
}
