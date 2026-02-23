import { api } from '../api.js';
import { setAuthToken } from './auth.js';

export async function loginUser(loginData) {
  try {
    console.log('Logging in with payload:', loginData);
    const response = await api('/users/login', {
      method: 'POST',
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
      setAuthToken(token);
      console.log('Token saved to localStorage via auth helper');
    }

    return result;
  } catch (error) {
    console.error('Failed to login:', error);
    alert(`Login failed: ${error.message}`);
    throw error;
  }
}