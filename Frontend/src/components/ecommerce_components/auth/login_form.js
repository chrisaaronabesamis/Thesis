import { loginUser } from '../../../services/ecommerce_services/auth/signin.js';
import '../user/request_password_reset.js';

export default function LoginForm(root) {
  // If user already has an auth token, redirect immediately before rendering the form
  if (localStorage.getItem('authToken')) {
    window.location.href = 'http://localhost:5173/';
    return;
  }


  root.innerHTML = `
    <section class="auth-section">
        <h2 class="section-title">Login</h2>

        <form class="auth-form1">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" class="mv-btn">Login</button>
            <p>Don't have an account? <a href="http://localhost:5173/signup">Sign up</a></p>
            <p>Forgot Password? <a href="#" class="forgot-password-link">Click Here</a></p>
        </form>
    </section>
  `;

  const form = root.querySelector('.auth-form1');
  const forgotPasswordLink = root.querySelector('.forgot-password-link');

  // Add click handler for forgot password link
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.showPasswordResetModal();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      await loginUser(data);
      window.location.href = '/'; 
    } catch (err) {
      console.error('Failed to login:', err);
    }
  });
}
