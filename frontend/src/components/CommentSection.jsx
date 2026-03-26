import { useState } from "react";
import { getLoggedInUser } from "../api";

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
    --radius: 6px;
  }

  .comments-section {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }

  .comments-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .comments-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .comments-count {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .comment {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .comment:hover {
    border-color: #d4cfc4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #e0a890);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--surface);
    flex-shrink: 0;
  }

  .comment-author {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .comment-date {
    font-size: 0.72rem;
    color: var(--muted);
  }

  .comment-content {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    line-height: 1.7;
    color: var(--ink);
    margin: 0;
  }

  .no-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 12px;
    color: var(--muted);
    background: var(--surface);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
  }

  .no-comments svg {
    opacity: 0.4;
  }

  .no-comments span {
    font-size: 0.85rem;
    font-weight: 300;
  }

  /* Comment form */
  .comment-form {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .comment-form-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
    display: block;
  }

  .comment-form-textarea {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    min-height: 100px;
    resize: vertical;
    outline: none;
    line-height: 1.7;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .comment-form-textarea::placeholder {
    color: #c2bdb4;
  }

  .comment-form-textarea:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(168, 164, 154, 0.12);
  }

  .comment-form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  .comment-form-hint {
    font-size: 0.72rem;
    color: var(--muted);
  }

  .comment-form-hint.error {
    color: var(--accent);
  }

  .comment-form-submit {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--surface);
    border: none;
    border-radius: var(--radius);
    padding: 10px 24px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
  }

  .comment-form-submit:hover:not(:disabled) {
    background: #2e2e2b;
  }

  .comment-form-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .comment-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(245, 242, 235, 0.3);
    border-top-color: var(--surface);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .comment-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2ef;
    border: 1px solid #f5c6ba;
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 0.8rem;
    color: var(--accent);
    margin-bottom: 16px;
  }

  .login-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    gap: 12px;
    text-align: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-top: 24px;
  }

  .login-prompt svg {
    opacity: 0.3;
  }

  .login-prompt-text {
    font-size: 0.85rem;
    color: var(--muted);
    font-weight: 300;
  }
`;

const COMMENT_MAX = 500;

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

function CommentSection({ comments = [], onSubmit, loading, error, isLoggedIn }) {
  const [text, setText] = useState("");
  const [fieldError, setFieldError] = useState(null);

  const handleSubmit = () => {
    if (!text.trim()) {
      setFieldError("Comment can't be empty.");
      return;
    }
    if (text.length > COMMENT_MAX) {
      setFieldError(`Keep it under ${COMMENT_MAX} characters.`);
      return;
    }
    setFieldError(null);
    onSubmit(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const nearLimit = text.length > COMMENT_MAX * 0.85;
  const currentUser = getLoggedInUser();

  return (
    <>
      <style>{styles}</style>

      <section className="comments-section">
        <div className="comments-header">
          <h2 className="comments-title">Comments</h2>
          <span className="comments-count">
            {comments.length} {comments.length === 1 ? "reply" : "replies"}
          </span>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>No comments yet — start the conversation.</span>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment.id ?? comment._id ?? index}
                className="comment"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="comment-header">
                  <div className="comment-avatar">
                    {(comment.author || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="comment-author">{comment.author || "Anonymous"}</span>
                    {comment.createdAt && (
                      <span className="comment-date"> · {formatDate(comment.createdAt)}</span>
                    )}
                  </div>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {isLoggedIn ? (
          <div className="comment-form">
            <label className="comment-form-label">Write a comment</label>

            {error && (
              <div className="comment-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <textarea
              className="comment-form-textarea"
              placeholder="Share your thoughts… (Ctrl + Enter to submit)"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (fieldError) setFieldError(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={COMMENT_MAX + 50}
              aria-label="Comment text"
            />

            <div className="comment-form-footer">
              <span className={`comment-form-hint${fieldError ? " error" : ""}${nearLimit ? " error" : ""}`}>
                {fieldError || (
                  <>
                    {text.length} / {COMMENT_MAX}
                    {nearLimit && text.length > COMMENT_MAX && " (exceeds limit)"}
                  </>
                )}
              </span>
              <button
                className="comment-form-submit"
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="comment-spinner" />
                    Posting…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="login-prompt">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <p className="login-prompt-text">
              <a href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Log in</a> to join the conversation
            </p>
          </div>
        )}
      </section>
    </>
  );
}

export default CommentSection;
