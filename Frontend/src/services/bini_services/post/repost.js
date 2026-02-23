// Repost a specific post by postId
import { BINI_API_URL } from '../../../config/bini-api.js';

export async function repost(postId, token) {
  const url = `${BINI_API_URL}/posts/${postId}/repost`;
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to repost');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reposting:', error);
    throw error;
  }
}
