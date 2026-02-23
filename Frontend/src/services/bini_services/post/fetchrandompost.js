// Fetch random posts from the API
import { BINI_API_URL } from '../../../config/bini-api.js';

export async function fetchrandomposts(token, limit = 7, offset = 0) {
  try {
    const url = `${BINI_API_URL}/posts/getrandomposts?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread',
      },
    });

    const responseData = await response.json().catch(() => ({}));
    console.log('Response from API:', responseData);

    if (!response.ok) {
      console.warn('Error fetching posts:', responseData.message || responseData);
      return [];
    }

    return responseData || []; // Adjust based on the actual structure returned by the API
  } catch (error) {
    console.error('Error in fetchrandomposts:', error);
    throw error;
  }
}
