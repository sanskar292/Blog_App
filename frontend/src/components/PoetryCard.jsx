import { useState } from "react";
import { Link } from "react-router-dom";
import { getLoggedInUser } from "../api";
import DOMPurify from "dompurify";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap');

  :root {
    --poetry-ink: #2d2d3a;
    --poetry-paper: #f8f6f0;
    --poetry-muted: #8b8699;
    --poetry-accent: #7c5cb8;
    --poetry-surface: #fffef9;
    --poetry-border: #e6e2d8;
    --poetry-gold: #b8985c;
    --poetry-radius: 2px;
    --poetry-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    --poetry-shadow-hover: 0 4px 12px rgba(124, 92, 184, 0.08);
  }

  .poetry-card {
    background: var(--poetry-surface);
    border: 1px solid var(--poetry-border);
    border-radius: var(--poetry-radius);
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
  }

  .poetry-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--poetry-accent), var(--poetry-gold));
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poetry-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124, 92, 184, 0.02), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .poetry-card:hover {
    border-color: var(--poetry-accent);
    box-shadow: var(--poetry-shadow-hover);
    transform: translateY(-3px);
  }

  .poetry-card:hover::before { transform: scaleY(1); }
  .poetry-card:hover::after { opacity: 1; }

  .poetry-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }

  .poetry-card-mood {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--poetry-accent);
    background: rgba(124, 92, 184, 0.08);
    padding: 4px 12px;
    border-radius: 20px;
    transition: all 0.2s ease;
  }

  .poetry-card:hover .poetry-card-mood {
    background: rgba(124, 92, 184, 0.12);
  }

  .poetry-card-author {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.68rem;
    font-weight: 400;
    color: var(--poetry-muted);
    letter-spacing: 0.08em;
  }

  .poetry-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 300;
    font-style: italic;
    color: var(--poetry-ink);
    line-height: 1.25;
    margin: 4px 0 0;
    position: relative;
    z-index: 1;
    transition: color 0.2s ease;
  }

  .poetry-card:hover .poetry-card-title {
    color: var(--poetry-accent);
  }

  .poetry-card-content {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.82rem;
    font-weight: 200;
    line-height: 1.9;
    color: var(--poetry-muted);
    position: relative;
    z-index: 1;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .poetry-card-content strong,
  .poetry-card-content b {
    font-weight: 500;
    color: var(--poetry-ink);
  }

  .poetry-card-content em,
  .poetry-card-content i {
    font-style: italic;
  }

  .poetry-card-content h1,
  .poetry-card-content h2,
  .poetry-card-content h3 {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    color: var(--poetry-ink);
    margin: 0.8em 0;
    line-height: 1.3;
  }

  .poetry-card-content h1 { font-size: 1.3rem; }
  .poetry-card-content h2 { font-size: 1.15rem; }
  .poetry-card-content h3 { font-size: 1rem; }

  .poetry-card-content blockquote {
    border-left: 2px solid var(--poetry-accent);
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: var(--poetry-muted);
  }

  .poetry-card-content code {
    background: rgba(124, 92, 184, 0.1);
    padding: 2px 6px;
    border-radius: 2px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.85em;
    color: var(--poetry-accent);
  }

  .poetry-card-content pre {
    background: rgba(124, 92, 184, 0.08);
    border-radius: var(--poetry-radius);
    padding: 10px 12px;
    overflow-x: auto;
    margin: 1em 0;
    font-size: 0.8rem;
  }

  .poetry-card-content ul,
  .poetry-card-content ol {
    margin: 0.8em 0;
    padding-left: 1.5em;
  }

  .poetry-card-content li {
    margin: 0.4em 0;
  }

  .poetry-card-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(230, 226, 216, 0.5);
    position: relative;
    z-index: 1;
  }

  .poetry-card-tag {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.62rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--poetry-muted);
    background: rgba(139, 134, 153, 0.08);
    padding: 3px 10px;
    border-radius: 2px;
    transition: all 0.2s ease;
  }

  .poetry-card:hover .poetry-card-tag {
    background: rgba(124, 92, 184, 0.1);
    color: var(--poetry-accent);
  }

  .poetry-card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    color: var(--poetry-muted);
  }

  .poetry-card-date {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .poetry-card-actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--poetry-border);
    position: relative;
    z-index: 1;
  }

  .poetry-action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--poetry-muted);
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .poetry-action-btn:hover {
    color: var(--poetry-accent);
  }

  .poetry-action-btn.delete:hover {
    color: #c44569;
  }

  .poetry-card-confirm {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.72rem;
    color: var(--poetry-ink);
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--poetry-border);
    position: relative;
    z-index: 1;
  }

  .poetry-confirm-yes {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--poetry-accent);
    color: #fff;
    border: none;
    border-radius: 2px;
    padding: 5px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .poetry-confirm-yes:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  .poetry-confirm-no {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--poetry-surface);
    color: var(--poetry-muted);
    border: 1px solid var(--poetry-border);
    border-radius: 2px;
    padding: 5px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .poetry-confirm-no:hover {
    color: var(--poetry-ink);
    border-color: var(--poetry-ink);
  }

  .poetry-card.deleting {
    opacity: 0.4;
    pointer-events: none;
  }

  @media (max-width: 600px) {
    .poetry-card {
      padding: 24px 20px;
    }
    .poetry-card-title {
      font-size: 1.35rem;
    }
    .poetry-card-meta {
      margin-left: 0;
      margin-top: 8px;
    }
  }
`;

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function PoetryCard({ poem, onDelete, deletingId }) {
  const [confirming, setConfirming] = useState(false);
  const currentUser = getLoggedInUser();
  const isOwner = currentUser && currentUser === poem.author;
  const isDeleting = deletingId === poem.id;

  return (
    <>
      <style>{styles}</style>

      <Link to={`/poetry/${poem.id}`} className={`poetry-card${isDeleting ? " deleting" : ""}`}>
        <div className="poetry-card-header">
          <span className="poetry-card-mood">
            {poem.mood || "Reflection"}
          </span>
          {poem.author && (
            <span className="poetry-card-author">by {poem.author}</span>
          )}
        </div>

        <h2 className="poetry-card-title">{poem.title}</h2>

        <div
          className="poetry-card-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(poem.content) }}
        />

        <div className="poetry-card-footer">
          {poem.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="poetry-card-tag">
              {tag}
            </span>
          ))}

          <div className="poetry-card-meta">
            {poem.createdAt && (
              <span className="poetry-card-date">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDate(poem.createdAt)}
              </span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="poetry-card-actions" onClick={(e) => e.preventDefault()}>
            {!confirming ? (
              <>
                <Link to={`/poetry/${poem.id}`} className="poetry-action-btn">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Link>
                <button className="poetry-action-btn delete" onClick={() => setConfirming(true)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </>
            ) : (
              <div className="poetry-card-confirm" onClick={(e) => e.preventDefault()}>
                <span>Delete this poem?</span>
                <button
                  className="poetry-confirm-yes"
                  onClick={() => {
                    setConfirming(false);
                    onDelete(poem.id);
                  }}
                >
                  Yes
                </button>
                <button className="poetry-confirm-no" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </Link>
    </>
  );
}

export default PoetryCard;
