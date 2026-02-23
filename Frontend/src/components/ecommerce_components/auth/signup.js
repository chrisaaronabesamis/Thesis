import { registerUser } from '../../../services/ecommerce_services/auth/signup_user.js';

export default function Signup(root) {
    root.innerHTML = `
        <section class="auth-section">
            <h2 class="section-title">Sign Up</h2>

            <form class="auth-form1">
                <input type="text" placeholder="First Name" required>
                <input type="text" placeholder="Last Name" required>
                <input type="email" placeholder="Email" required>
                <input type="password" placeholder="Password" required>
                <button type="submit" class="mv-btn">Create Account</button>
                <p>Already have an account? <a href="/signin">Login</a></p>
            </form>
        </section>
    `;

    // Select the form
    const form = root.querySelector('.auth-form1');

    // Add event listener
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstname = form.querySelector('input[placeholder="First Name"]').value;
        const lastname = form.querySelector('input[placeholder="Last Name"]').value;
        const email = form.querySelector('input[placeholder="Email"]').value;
        const password = form.querySelector('input[placeholder="Password"]').value;
        
        const data = {
            username: email,
            password,
            email,
            firstname,
            lastname,
            imageUrl: "none",
        };

        try {
            const res = await registerUser(data);
            console.log("Registration success:", res);
            alert("Account created successfully!");
            // Store the community
            localStorage.setItem('communi_type', "bini");
            window.location.href = "/signin";
        } catch (err) {
            console.error("Failed to register:", err);
            alert("Registration failed: " + (err.message || "Unknown error"));
        }
    });
}
