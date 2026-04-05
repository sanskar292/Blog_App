import { useState } from "react";
import { getLoggedInUser } from "../api";
import "./CommentSection.css";


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
