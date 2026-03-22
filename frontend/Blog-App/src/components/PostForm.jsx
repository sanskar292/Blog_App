import { useState } from "react";
import { createNewPost } from "../api";

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

  .post-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .post-form-heading {
    font-family: 'Instrument Serif', serif;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.01em;
    margin-bottom: 20px;
  }

  .post-form-heading em {
    font-style: italic;
    color: var(--accent);
  }

  /* Field */
  .post-form-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
  }

  .post-form-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    transition: color 0.15s;
  }

  .post-form-field:focus-within .post-form-label {
    color: var(--ink);
  }

  .post-form-input,
  .post-form-textarea {
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
    resize: none;
  }

  .post-form-input::placeholder,
  .post-form-textarea::placeholder {
    color: #c2bdb4;
    font-weight: 300;
  }

  .post-form-input:focus,
  .post-form-textarea:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(168,164,154,0.15);
  }

  .post-form-input.has-error,
  .post-form-textarea.has-error {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(200,80,42,0.1);
  }

  .post-form-textarea {
    min-height: 100px;
    line-height: 1.65;
  }

  .post-form-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: var(--accent);
    margin-top: 2px;
  }

  /* Char counter */
  .post-form-meta {
    display: flex;
    justify-content: flex-end;
    margin-top: -10px;
    margin-bottom: 14px;
  }

  .post-form-chars {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: var(--muted);
    font-weight: 400;
  }

  .post-form-chars.near-limit { color: var(--accent); }

  /* Footer row */
  .post-form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }

  .post-form-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 300;
  }

  /* Submit button */
  .post-form-submit {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    border: none;
    border-radius: var(--radius);
    padding: 9px 22px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
    position: relative;
    overflow: hidden;
  }

  .post-form-submit:hover:not(:disabled) {
    background: #2e2e2b;
  }

  .post-form-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Spinner */
  .post-form-spinner {
    width: 13px;
    height: 13px;
    border: 2px solid rgba(245,242,235,0.35);
    border-top-color: var(--paper);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Success flash */
  .post-form-success {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--success);
    animation: fadeSlide 0.3s ease;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* API error banner */
  .post-form-api-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2ef;
    border: 1px solid #f5c6ba;
    border-radius: var(--radius);
    padding: 9px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: var(--accent);
    margin-bottom: 14px;
    animation: fadeSlide 0.25s ease;
  }
`;

const TITLE_MAX = 120;
const CONTENT_MAX = 1000;

function validate(form) {
  const errors = {};
  if (!form.title.trim())        errors.title   = "Title is required.";
  else if (form.title.length > TITLE_MAX)
                                 errors.title   = `Title must be under ${TITLE_MAX} chars.`;
  if (!form.content.trim())      errors.content = "Content is required.";
  else if (form.content.length > CONTENT_MAX)
                                 errors.content = `Content must be under ${CONTENT_MAX} chars.`;
  return errors;
}

function PostForm({ refresh }) {
  const [form,       setForm]       = useState({ title: "", content: "" });
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [apiError,   setApiError]   = useState(null);

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (field) => {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { title: true, content: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      await createNewPost(form);
      setForm({ title: "", content: "" });
      setTouched({});
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      refresh();
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isBlank = !form.title.trim() || !form.content.trim();
  const contentNearLimit = form.content.length > CONTENT_MAX * 0.85;

  return (
    <>
      <style>{styles}</style>

      <div className="post-form">
        <h2 className="post-form-heading">
          New <em>entry</em>
        </h2>

        {apiError && (
          <div className="post-form-api-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {apiError}
          </div>
        )}

        {/* Title */}
        <div className="post-form-field">
          <label className="post-form-label" htmlFor="pf-title">Title</label>
          <input
            id="pf-title"
            className={`post-form-input${touched.title && errors.title ? " has-error" : ""}`}
            placeholder="Give it a name…"
            value={form.title}
            onChange={e => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            maxLength={TITLE_MAX + 20}
            autoComplete="off"
          />
          {touched.title && errors.title && (
            <span className="post-form-error" role="alert">{errors.title}</span>
          )}
        </div>

        {/* Content */}
        <div className="post-form-field">
          <label className="post-form-label" htmlFor="pf-content">Content</label>
          <textarea
            id="pf-content"
            className={`post-form-textarea${touched.content && errors.content ? " has-error" : ""}`}
            placeholder="What's on your mind…"
            value={form.content}
            onChange={e => handleChange("content", e.target.value)}
            onBlur={() => handleBlur("content")}
            maxLength={CONTENT_MAX + 50}
          />
          {touched.content && errors.content && (
            <span className="post-form-error" role="alert">{errors.content}</span>
          )}
        </div>

        <div className="post-form-meta">
          <span className={`post-form-chars${contentNearLimit ? " near-limit" : ""}`}>
            {form.content.length} / {CONTENT_MAX}
          </span>
        </div>

        <div className="post-form-footer">
          {success ? (
            <span className="post-form-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Post published!
            </span>
          ) : (
            <span className="post-form-hint">
              {isBlank ? "Fill in both fields to publish." : "Ready to publish."}
            </span>
          )}

          <button
            className="post-form-submit"
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span className="post-form-spinner" />
                Publishing…
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default PostForm;