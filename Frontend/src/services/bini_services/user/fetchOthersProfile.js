

// Use configured API URL or fall back to localhost backend used in development
const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';

console.log('fetchOthersProfile BINI_URL:', BINI_URL);

export async function fetchOthersData(userId, token) {
  try {
    const response = await fetch(`${BINI_URL}/users/profile/${userId}`, {
      method: 'GET',
      headers: {
        'apikey': 'thread',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // If response is not OK, capture body (may be JSON or HTML) and throw a helpful error
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '<no-body>');
      console.error('fetchOthersData non-OK response:', response.status, response.statusText, bodyText.slice ? bodyText.slice(0, 1000) : bodyText);
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }

    // If the server returned HTML (e.g. an error page), avoid calling response.json() which throws
    if (!contentType.includes('application/json')) {
      const bodyText = await response.text().catch(() => '<no-body>');
      console.error('fetchOthersData expected JSON but received:', contentType, bodyText.slice ? bodyText.slice(0, 1000) : bodyText);
      throw new Error('Unexpected non-JSON response from profile endpoint');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching other user profile:', error);
    throw error;
  }
}


