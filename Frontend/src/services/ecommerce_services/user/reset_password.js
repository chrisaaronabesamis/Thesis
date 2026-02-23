import { api } from '../api.js';

export async function requestPasswordReset(email) {
    try {
        const response = await api('/users/forgot_password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset link');
        }

        return {
            success: true,
            message: 'Password reset link has been sent to your email address. Please check your inbox.'
        };

    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred. Please try again later.'
        };
    }
}