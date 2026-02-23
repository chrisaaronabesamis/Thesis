// Fetch profile data for the currently authenticated user

const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';

export async function fetchProfileData(token) {
  try {
    const response = await fetch(`${BINI_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'apikey': 'thread', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile data');
    }

    const data = await response.json();
    return data.user;  // Return the user data
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw new Error("Error fetching profile data: " + error.message);
  }
}
// Fetch profile data for a specific user by userId
export async function fetchprofileData(userId, token) {
  try {
    const response = await fetch(`${BINI_URL}/users/profile/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'apikey': 'thread', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile data');
    }

    const data = await response.json();
    return data.user;  // Return the user data
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw new Error("Error fetching profile data: " + error.message);
  }
}



