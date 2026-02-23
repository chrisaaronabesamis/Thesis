import { api } from '../api.js';

export async function updatePassword(email, otp, newPassword) {
  try {
    const response = await api('/users/reset_password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update password',
      };
    }

    return {
      success: true,
      message: data.message || 'Password has been updated successfully.',
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error',
    };
  }
}