import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --surface: #fffdf8;
    --border: #e2ded4;
    --border-focus: #a8a49a;
    --radius: 4px;
    --success: #3a7d44;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--paper);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    min-height: 100vh;
  }

  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .auth-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .auth-heading {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 6px;
  }

  .auth-heading em {
    font-style: italic;
    color: var(--accent);
  }

  .auth-subtext {
    font-size: 0.83rem;
    font-weight: 300;
    color: var(--muted);
    margin-bottom: 32px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
  }

  .auth-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    transition: color 0.15s;
  }

  .auth-field:focus-within .auth-label { color: var(--ink); }

  .auth-input {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }

  .auth-input::placeholder { color: #c2bdb4; }

  .auth-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(168,164,154,0.15);
  }

  .auth-input.has-error {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(200,80,42,0.1);
  }

  .auth-field-error {
    font-size: 0.75rem;
    color: var(--accent);
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2ef;
    border: 1px solid #f5c6ba;
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 0.82rem;
    color: var(--accent);
    margin-bottom: 16px;
    animation: fadeIn 0.2s ease;
  }

  .auth-success {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f0faf2;
    border: 1px solid #b6ddbf;
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 0.82rem;
    color: var(--success);
    margin-bottom: 16px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-submit {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    border: none;
    border-radius: var(--radius);
    padding: 11px;
    width: 100%;
    cursor: pointer;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
  }

  .auth-submit:hover:not(:disabled) { background: #2e2e2b; }
  .auth-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .auth-spinner {
    width: 13px;
    height: 13px;
    border: 2px solid rgba(245,242,235,0.3);
    border-top-color: var(--paper);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 0.82rem;
    color: var(--muted);
  }

  .auth-footer a {
    color: var(--ink);
    font-weight: 500;
    text-decoration: none;
    border-bottom: 1px solid var(--ink);
    transition: color 0.15s, border-color 0.15s;
  }

  .auth-footer a:hover {
    color: var(--accent);
    border-color: var(--accent);
  }
`;

function validate(form) {
  const errors = {};
  if (!form.username?.trim())          errors.username = "Username is required.";
  else if (form.username.length < 3)   errors.username = "At least 3 characters.";
  if (!form.password?.trim())          errors.password = "Password is required.";
  else if (form.password.length < 6)   errors.password = "At least 6 characters.";
  return errors;
}

function Register() {
  const [form,       setForm]       = useState({ username: "", password: "" });
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState(null);
  const [success,    setSuccess]    = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { username: true, password: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      await registerUser({ username: form.username, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        setApiError("Username already taken. Try another.");
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-heading">Create an <em>account</em></h1>
          <p className="auth-subtext">Join and start writing today.</p>

          {apiError && (
            <div className="auth-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          {success && (
            <div className="auth-success" role="status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Account created! Taking you home…
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                className={`auth-input${touched.username && errors.username ? " has-error" : ""}`}
                placeholder="Choose a username"
                value={form.username}
                onChange={e => handleChange("username", e.target.value)}
                onBlur={() => handleBlur("username")}
                autoComplete="username"
                autoFocus
              />
              {touched.username && errors.username && (
                <span className="auth-field-error">{errors.username}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className={`auth-input${touched.password && errors.password ? " has-error" : ""}`}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                autoComplete="new-password"
              />
              {touched.password && errors.password && (
                <span className="auth-field-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting || success}
              aria-busy={submitting}
            >
              {submitting ? (
                <><span className="auth-spinner" /> Creating account…</>
              ) : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;