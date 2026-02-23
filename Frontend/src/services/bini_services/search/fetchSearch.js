// Fetch users based on search keyword
const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';

export async function fetchSearchAll(token, keyword) {
  try {
    const response = await fetch(`${BINI_URL}/search/users?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'apikey': 'thread',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Log response body to help debug 500 errors from the backend
      const text = await response.text().catch(() => '<no-body>');
      console.error(`Search API error: ${response.status} ${response.statusText}`, text);
      throw new Error('Failed to fetch search results');
    }

    return await response.json(); // { users: [...] }
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

export default fetchSearchAll;