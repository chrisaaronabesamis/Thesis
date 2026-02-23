// Halimbawa fetchUserById function


const BINI_URL = import.meta.env.VITE_BINI_API_URL;

export async function fetchUserById(userId, token) {
  try {
    const response = await fetch(`${BINI_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (e) {
    return { fullname: `User #${userId}`, profile_picture: 'default-profile.png' };
  }
}