import { registerUser } from '../../../services/bini_services/user/User-Api.js';
import { BINI_API_URL } from '../../../config/bini-api.js';

export default function RegisterformComponent(root) {
  root.innerHTML = `
    <div class="signUp-container">
      <div class="signup-card">SIGNUP</div>
      <div class="sigup-form">
        <form id="createAcct-form">
          <label>Username</label>
          <input type="text" id="username" name="username" placeholder="Username" required />
          <label>Full Name</label>
          <input type="text" id="fullname" name="fullname" placeholder="Full Name" required />
          <label>Email</label>
          <input type="text" id="email" name="email" placeholder="Email" required />
          <label>Password</label>
          <input type="password" id="password" name="password" placeholder="Password" required />
          <label>Confirm password</label>
          <input type="password" id="confirmPass" name="confirmPass" placeholder="Confirm Password" required />
          <input type="file" id="imageFile" accept="image/*" />
          <button type="submit" class="sign-btn">Sign In</button>
        </form>
      </div>
      <p id="already-have-account">
        Already have an account? <a id="already-have-account-link" href="http://localhost:5173/bini/login">Log in</a>
      </p>
    </div>
  `;

  const form = root.querySelector('#createAcct-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = form.querySelector('#username').value;
    const fullname = form.querySelector('#fullname').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPass').value;
    const email = form.querySelector('#email').value;
    const imageFile = form.querySelector('#imageFile').files[0];

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      let imageUrl = '';
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('file', imageFile);

        const uploadResponse = await fetch(`${BINI_API_URL}/cloudinary/upload`, {
          method: 'POST',
          body: imageData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Image upload failed');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }

      const userData = {
        username,
        fullname,
        password,
        email,
        imageUrl,
      };

        const result = await registerUser(userData);

  if (result.token) {
      localStorage.setItem('authToken', result.token);
      if (result.user && (result.user.id || result.user.user_id)) {
          localStorage.setItem('userId', result.user.id || result.user.user_id);
      }
  }

  alert('User registered successfully');
  window.location.href = 'http://localhost:5173/bini/login';

    } catch (error) {
      console.error('Error registering user:', error);
      alert(`Registration failed: ${error.message}`);
    }
  });
}