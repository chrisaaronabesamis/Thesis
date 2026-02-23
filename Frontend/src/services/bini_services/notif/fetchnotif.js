const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';

export async function fetchNotifications(token) {
  try {
    const response = await fetch(`${BINI_URL}/notifications/mynotif`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': 'thread'
      },
    });
    // Log the raw response object (optional)
    console.log('Raw response:', response);

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const data = await response.json();
    // Log the data for debugging (remove alert in production)
    console.log('Notifications data:', data);

    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export default fetchNotifications;