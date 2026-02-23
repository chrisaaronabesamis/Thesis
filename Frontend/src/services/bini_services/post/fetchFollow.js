

const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';

export async function follow(userId, token) {
  try {
    const response = await fetch(`${BINI_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'apikey': 'thread',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to follow');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching other user profile:', error);
    throw error;
  }
}

export default follow;