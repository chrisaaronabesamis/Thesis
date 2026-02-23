export function getAuthToken() {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem('authToken', token);
  } catch (e) {}
}

export function removeAuthToken() {
  try {
    localStorage.removeItem('authToken');
  } catch (e) {}
}

export function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, apikey: 'thread' } : { apikey: 'thread' };
}

export default { getAuthToken, setAuthToken, removeAuthToken, authHeaders };
