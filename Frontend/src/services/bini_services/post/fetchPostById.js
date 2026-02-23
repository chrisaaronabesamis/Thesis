
const BINI_URL = import.meta.env.VITE_BINI_API_URL;

export async function fetchPostById(postId, token) {
  try {
    const response = await fetch(`${BINI_URL}/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  }
}