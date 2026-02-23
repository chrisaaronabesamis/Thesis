

const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';
console.log('User-Api BINI_URL:', BINI_URL);

export async function registerUser(userData) {
  try {
    console.log('User Data:', userData);

    const response = await fetch(`${BINI_URL}/users/register`, {
      method: 'POST',
      headers: {
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', errorData);
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to register:', error);
    alert(`Registration failed: ${error.message}`);
    throw error;
  }
}

export async function loginUser(loginData) {
  try {
    const response = await fetch(`${BINI_URL}/users/login`, {
      method: 'POST',
      headers: {
        'apikey': 'thread',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }

    const result = await response.json();
    const token = result.token;

    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Token saved to localStorage');
    }

    return result;
  } catch (error) {
    console.error('Failed to login:', error);
    alert(`Login failed: ${error.message}`);
    throw error;
  }
}