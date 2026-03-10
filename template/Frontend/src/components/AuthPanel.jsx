import { useEffect, useRef, useState } from "react";

export default function AuthPanel({
  onLogin,
  onRegister,
  onLogout,
  onGoogleContinue,
  loading = false,
  profile,
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", fullname: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const googleButtonRef = useRef(null);
  const recaptchaRef = useRef(null);
  const recaptchaTokenRef = useRef("");
  const isLocalhost = /^localhost$|^127\.0\.0\.1$/.test(window.location.hostname);
  const bypassRecaptchaLocal = String(import.meta.env.VITE_BYPASS_RECAPTCHA_LOCAL || "true").toLowerCase() === "true";
  const recaptchaRequired = !(isLocalhost && bypassRecaptchaLocal);
  const allowGoogleOnLocal = String(import.meta.env.VITE_ENABLE_GOOGLE_LOCAL || "").toLowerCase() === "true";
  const hasGoogleClientId = Boolean(String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim());
  const googleEnabled = hasGoogleClientId && (!isLocalhost || allowGoogleOnLocal);

  function updateField(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    recaptchaTokenRef.current = recaptchaToken;
  }, [recaptchaToken]);

  useEffect(() => {
    if (!googleEnabled) return;
    if (window.google?.accounts?.id && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: async (response) => {
          try {
            await onGoogleContinue?.(response?.credential, recaptchaTokenRef.current);
            setStatus("Google sign-in successful.");
          } catch (error) {
            const message = error?.response?.data?.error || error?.message || "Google sign-in failed.";
            setStatus(message);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
      });
    }
  }, [onGoogleContinue, googleEnabled]);

  useEffect(() => {
    if (window.grecaptcha && recaptchaRef.current && !recaptchaRef.current.dataset.rendered) {
      const widgetId = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || "",
        callback: (token) => setRecaptchaToken(token),
        "expired-callback": () => setRecaptchaToken(""),
      });
      recaptchaRef.current.dataset.rendered = String(widgetId);
    }
  }, []);

  function handleGoogleButtonClick() {
    if (!googleEnabled) {
      setStatus("Google sign-in is disabled for localhost. Use email/password login.");
      return;
    }
    if (recaptchaRequired && !recaptchaTokenRef.current) {
      setStatus("Please complete reCAPTCHA first.");
      return;
    }
    if (!window.google?.accounts?.id) {
      setStatus("Google service is not ready.");
      return;
    }
    window.google.accounts.id.prompt();
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("");
    if (recaptchaRequired && !recaptchaToken) {
      setStatus("Please complete reCAPTCHA.");
      return;
    }

    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setStatus("Password and confirm password do not match.");
          return;
        }
        await onRegister({ email: form.email, password: form.password, fullname: form.fullname });
        setStatus("Registration successful. You can log in now.");
        setMode("login");
        return;
      }

      await onLogin({ email: form.email, password: form.password });
      setStatus("Logged in.");
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.message || "Request failed.";
      setStatus(message);
    }
  }

  function EyeIcon({ open = false }) {
    if (open) {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 4l16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  function EmailIcon() {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M1.5 4.5 8 8.9l6.5-4.4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  function LockIcon() {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.7 7V5.6a3.3 3.3 0 1 1 6.6 0V7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <rect x="3.2" y="7" width="9.6" height="6.2" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  function UserIcon() {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="5.1" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3.1 12.8c1-2 2.6-3 4.9-3s3.9 1 4.9 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <section id="login" className="panel auth-panel">
      <div className="auth-shell">
        <p className="eyebrow">Secure Access</p>
        <h2>Community Access</h2>
        {profile?.user?.fullname && <p className="success">Welcome back, {profile.user.fullname}</p>}
        {profile?.user?.email ? <p className="muted">{profile.user.email}</p> : null}
        {profile?.user ? (
          <button className="logout-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        ) : null}
        {!profile?.user ? (
          <>
            <div className="auth-switch">
              <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>Login</button>
              <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>Register</button>
            </div>
            <form className="u-auth-form" onSubmit={submit}>
              {mode === "register" ? (
                <label className="u-field">
                  <span className="u-icon"><UserIcon /></span>
                  <input name="fullname" value={form.fullname} onChange={updateField} placeholder="Full name" required />
                </label>
              ) : null}
              <label className="u-field">
                <span className="u-icon"><EmailIcon /></span>
                <input name="email" type="email" value={form.email} onChange={updateField} placeholder="Gmail address" required />
              </label>
              <label className="u-field password-field">
                <span className="u-icon"><LockIcon /></span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                  <span className="password-toggle-text">{showPassword ? "Hide" : "Show"}</span>
                </button>
              </label>
              {mode === "register" ? (
                <label className="u-field password-field">
                  <span className="u-icon"><LockIcon /></span>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    <EyeIcon open={showConfirmPassword} />
                    <span className="password-toggle-text">{showConfirmPassword ? "Hide" : "Show"}</span>
                  </button>
                </label>
              ) : null}
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </button>
              <p className="auth-divider">Gmail address or continue with Google</p>
              <div className="auth-third-party">
                <div ref={googleButtonRef} className="google-hidden-anchor" />
                <button type="button" className="google-cta" onClick={handleGoogleButtonClick} disabled={!googleEnabled}>
                  <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" aria-hidden="true">
                    <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
                    <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
                    <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" />
                    <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
                  </svg>
                  {googleEnabled ? "Continue with Google" : "Google disabled on localhost"}
                </button>
                {recaptchaRequired ? <div ref={recaptchaRef} className="recaptcha-box" /> : null}
              </div>
            </form>
          </>
        ) : null}
        {status ? <p className="muted auth-status">{status}</p> : null}
      </div>
    </section>
  );
}
