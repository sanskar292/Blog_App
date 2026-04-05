import { useState } from "react";
import { Link } from "react-router-dom";
import { getLoggedInUser } from "../api";
import { getThumbnail, handleImageError } from "../utils/imageUtils";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --surface: #fffdf8;
    --border: #e2ded4;
    --danger: #c8502a;
    --danger-bg: #fef2ef;
    --radius: 4px;
  }

  .article-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .article-card-thumb-wrapper {
    width: 100%;
    height: 160px;
    overflow: hidden;
  }

  .article-card-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .article-card:hover .article-card-thumb {
    transform: scale(1.05);
  }

  .article-card-content {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .article-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--accent);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.25s ease;
    z-index: 2;
  }

  .article-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    border-color: #ccc9be;
  }

  .article-card:hover::before { transform: scaleY(1); }

  .article-card-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.01em;
    line-height: 1.3;
    margin: 0;
  }

  .article-card-author {
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .article-card-excerpt {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 300;
    color: var(--muted);
    line-height: 1.65;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-card-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  .article-card-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 2px;
    border-bottom: 1.5px solid var(--ink);
    transition: color 0.15s, border-color 0.15s;
  }

  .article-card-link:hover { color: var(--accent); border-color: var(--accent); }
  .article-card-link svg { transition: transform 0.2s ease; }
  .article-card-link:hover svg { transform: translateX(3px); }

  .article-card-delete {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
  }

  .article-card-delete:hover { color: var(--danger); background: var(--danger-bg); }

  .article-card-confirm {
    position: absolute;
    inset: 0;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    animation: fadeIn 0.2s ease;
    z-index: 10;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .confirm-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--ink);
  }

  .confirm-actions { display: flex; gap: 10px; }

  .confirm-yes {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    padding: 7px 16px;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .confirm-yes:hover { opacity: 0.85; }

  .confirm-no {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 7px 16px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .confirm-no:hover { border-color: var(--ink); color: var(--ink); }
`;

function ArticleCard({ article, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const currentUser = getLoggedInUser();
  const isOwner     = currentUser && currentUser === article.author;
  const articleId      = article._id ?? article.id;

  const excerpt = article.content.length > 100
    ? article.content.substring(0, 100).trimEnd() + "…"
    : article.content;

  return (
    <>
      <style>{styles}</style>

      <article className="article-card">
        <div className="article-card-thumb-wrapper">
          <img 
            src={getThumbnail(article.coverImage, "article")} 
            alt={article.title} 
            className="article-card-thumb"
            onError={(e) => handleImageError(e, "article")}
          />
        </div>
        
        <div className="article-card-content">
          <h2 className="article-card-title">{article.title}</h2>
          {article.author && (
            <span className="article-card-author">by {article.author}</span>
          )}
          <p className="article-card-excerpt">{excerpt}</p>

          <div className="article-card-actions">
            <Link to={`/article/${articleId}`} className="article-card-link">
              Read
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            {/* Only show delete to the article owner */}
            {isOwner && (
              <button
                className="article-card-delete"
                onClick={() => setConfirming(true)}
                aria-label="Delete article"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {confirming && isOwner && (
          <div className="article-card-confirm" role="dialog" aria-label="Confirm deletion">
            <span className="confirm-label">Delete this article?</span>
            <div className="confirm-actions">
              <button className="confirm-no" onClick={() => setConfirming(false)}>Cancel</button>
              <button
                className="confirm-yes"
                onClick={() => { setConfirming(false); onDelete(articleId); }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </article>
    </>
  );
}

export default ArticleCard;
