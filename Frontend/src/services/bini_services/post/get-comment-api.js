

const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';
console.log('get-comment-api BINI_URL:', BINI_URL);

export async function getComments(postId, token) {
  try {
    const response = await fetch(`${BINI_URL}/comments/${postId}`, {
      method: 'GET',
      headers: {
        'apikey': 'thread',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}


