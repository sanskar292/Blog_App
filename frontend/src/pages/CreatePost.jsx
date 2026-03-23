import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--paper);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    min-height: 100vh;
  }

  .create-wrapper {
    max-width: 720px;
    margin: 0 auto;
    padding: 56px 24px 120px;
  }

  /* ── Header ── */
  .create-header {
    margin-bottom: 48px;
  }

  .create-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .create-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 400;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .create-title em { font-style: italic; color: var(--accent); }

  /* ── Cover preview ── */
  .cover-preview {
    width: 100%;
    height: 240px;
    object-fit: cover;
    border-radius: var(--radius);
    margin-bottom: 32px;
    border: 1px solid var(--border);
  }

  .cover-placeholder {
    width: 100%;
    height: 180px;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--muted);
    margin-bottom: 32px;
    font-size: 0.8rem;
  }

  /* ── Form ── */
  .create-form { display: flex; flex-direction: column; gap: 0; }

  .create-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; }

  .create-field-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    transition: color 0.15s;
  }

  .create-field:focus-within .create-field-label { color: var(--ink); }

  .create-input,
  .create-textarea {
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    color: var(--ink);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    padding: 8px 0;
    outline: none;
    width: 100%;
    transition: border-color 0.2s;
    font-size: 0.95rem;
  }

  /* Title gets serif treatment */
  .create-title-input {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.4rem, 3vw, 1.8rem);
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--ink);
    background: transparent;
    border: none;
    border-bottom: 1.5px solid var(--border);
    padding: 8px 0;
    outline: none;
    width: 100%;
    transition: border-color 0.2s;
  }

  .create-input:focus,
  .create-textarea:focus,
  .create-title-input:focus {
    border-color: var(--ink);
  }

  .create-input::placeholder,
  .create-textarea::placeholder,
  .create-title-input::placeholder {
    color: #c2bdb4;
  }

  .create-textarea {
    min-height: 320px;
    resize: none;
    line-height: 1.8;
  }

  /* Word count */
  .create-word-count {
    font-size: 0.72rem;
    color: var(--muted);
    text-align: right;
    margin-top: -16px;
    margin-bottom: 24px;
  }

  /* Tags input */
  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    border-bottom: 1px solid var(--border);
    padding: 8px 0;
    min-height: 40px;
    transition: border-color 0.2s;
  }

  .tags-wrapper:focus-within { border-color: var(--ink); }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    background: var(--border);
    color: var(--ink);
    padding: 3px 8px 3px 10px;
    border-radius: 2px;
  }

  .tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1;
    padding: 0;
    transition: color 0.15s;
  }
  .tag-remove:hover { color: var(--accent); }

  .tag-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 300;
    color: var(--ink);
    flex: 1;
    min-width: 120px;
  }
  .tag-input::placeholder { color: #c2bdb4; }

  .tags-hint {
    font-size: 0.72rem;
    color: var(--muted);
    margin-top: 6px;
  }

  /* ── Error ── */
  .create-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2ef;
    border: 1px solid #f5c6ba;
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 0.82rem;
    color: var(--accent);
    margin-bottom: 24px;
  }

  /* ── Footer ── */
  .create-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 32px;
    border-top: 1px solid var(--border);
    margin-top: 8px;
  }

  .create-hint {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .create-submit {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    border: none;
    border-radius: var(--radius);
    padding: 11px 28px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
  }
  .create-submit:hover:not(:disabled) { background: #2e2e2b; }
  .create-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .create-spinner {
    width: 13px;
    height: 13px;
    border: 2px solid rgba(245,242,235,0.3);
    border-top-color: var(--paper);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const MAX_TAGS = 5;

function CreatePost() {
  const navigate = useNavigate();

  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags,       setTags]       = useState([]);
  const [tagInput,   setTagInput]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Add tag on Enter or comma
  const handleTagKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (newTag && !tags.includes(newTag) && tags.length < MAX_TAGS) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSubmitting(true);
    setError(null);

    try {
      await createNewPost({
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        tags,
      });
      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("You need to be logged in to publish.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="create-wrapper">
        <div className="create-header">
          <p className="create-label">New story</p>
          <h1 className="create-title">Write something <em>worth reading.</em></h1>
        </div>

        {/* Cover preview */}
        {coverImage ? (
          <img src={coverImage} alt="Cover preview" className="cover-preview"
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div className="cover-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Cover image preview</span>
          </div>
        )}

        {error && (
          <div className="create-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form className="create-form" onSubmit={handleSubmit}>

          {/* Cover image URL */}
          <div className="create-field">
            <label className="create-field-label">Cover image URL</label>
            <input
              className="create-input"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Title */}
          <div className="create-field">
            <label className="create-field-label">Title</label>
            <input
              className="create-title-input"
              placeholder="Your story begins here…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="create-field">
            <label className="create-field-label">Content</label>
            <textarea
              className="create-textarea"
              placeholder="Write your story…"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div className="create-word-count">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>

          {/* Tags */}
          <div className="create-field">
            <label className="create-field-label">Tags</label>
            <div className="tags-wrapper">
              {tags.map(tag => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              {tags.length < MAX_TAGS && (
                <input
                  className="tag-input"
                  placeholder={tags.length === 0 ? "Add tags…" : ""}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                />
              )}
            </div>
            <span className="tags-hint">Press Enter or comma to add — max {MAX_TAGS} tags</span>
          </div>

          <div className="create-footer">
            <span className="create-hint">
              {wordCount > 0
                ? `~${Math.max(1, Math.round(wordCount / 200))} min read`
                : "Start writing to see read time"}
            </span>
            <button
              type="submit"
              className="create-submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <><span className="create-spinner" /> Publishing…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Publish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreatePost;