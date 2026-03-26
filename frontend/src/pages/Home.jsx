import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, deletePostById, getLoggedInUser } from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --surface: #fffdf8;
    --border: #e2ded4;
    --border-dark: #c9c4b8;
    --radius: 8px;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    min-height: 100vh;
  }

  .home-wrapper {
    max-width: 820px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  /* ── Header ── */
  .home-header {
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
    text-align: center;
  }

  .home-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.2rem, 5vw, 3rem);
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .home-title em { font-style: italic; color: var(--accent); }

  .home-subtitle {
    font-size: 0.95rem;
    color: var(--muted);
    font-weight: 300;
    max-width: 480px;
    line-height: 1.6;
    margin: 0 auto;
    text-align: center;
  }

  .home-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
  }

  .home-count {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: rgba(155, 150, 137, 0.1);
    padding: 5px 12px;
    border-radius: 20px;
  }

  /* ── Error ── */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fef2ef;
    border: 1px solid #f5c6ba;
    border-radius: var(--radius);
    padding: 12px 16px;
    margin-bottom: 24px;
    font-size: 0.85rem;
    color: var(--accent);
  }

  .error-dismiss {
    margin-left: auto;
    cursor: pointer;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 1.1rem;
    opacity: 0.7;
    transition: opacity 0.15s;
    padding: 0;
    line-height: 1;
  }

  .error-dismiss:hover { opacity: 1; }

  /* ── Skeleton ── */
  .skeleton-list { display: flex; flex-direction: column; gap: 16px; }

  .skeleton-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 2px;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Post list ── */
  .post-list { display: flex; flex-direction: column; gap: 16px; }

  /* ── Post Card ── */
  .post-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
    position: relative;
    overflow: hidden;
  }

  .post-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.25s ease;
  }

  .post-card:hover {
    border-color: var(--border-dark);
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }

  .post-card:hover::before { transform: scaleY(1); }

  .post-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .post-card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .post-card-author {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
    background: rgba(200, 80, 42, 0.08);
    padding: 4px 10px;
    border-radius: 20px;
  }

  .post-card-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border-dark);
    flex-shrink: 0;
  }

  .post-card-date {
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 300;
  }

  .post-card-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.35rem;
    font-weight: 400;
    line-height: 1.35;
    letter-spacing: -0.01em;
    color: var(--ink);
    transition: color 0.15s;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-card:hover .post-card-title { color: var(--accent); }

  .post-card-excerpt {
    font-size: 0.9rem;
    font-weight: 300;
    line-height: 1.7;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .post-card-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .post-card-tag {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--border);
    color: var(--muted);
    padding: 4px 10px;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .post-card:hover .post-card-tag {
    background: var(--ink);
    color: var(--surface);
  }

  .post-card-read-time {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    color: var(--muted);
    margin-left: auto;
    flex-shrink: 0;
  }

  .post-card-read-time svg {
    opacity: 0.6;
  }

  .post-card-image {
    width: 140px;
    height: 100px;
    object-fit: cover;
    border-radius: var(--radius);
    flex-shrink: 0;
    background: var(--border);
    box-shadow: var(--shadow);
  }

  .post-card-image-placeholder {
    width: 140px;
    height: 100px;
    border-radius: var(--radius);
    background: var(--border);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    opacity: 0.5;
  }

  .post-card-actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .post-card-action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color 0.15s;
    text-decoration: none;
  }

  .post-card-action-btn:hover { color: var(--ink); }
  .post-card-action-btn.delete:hover { color: var(--accent); }

  .post-card-confirm {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.78rem;
    color: var(--ink);
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .confirm-yes {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 6px 14px;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }

  .confirm-yes:hover { opacity: 0.9; transform: translateY(-1px); }

  .confirm-no {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--surface);
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .confirm-no:hover { color: var(--ink); border-color: var(--ink); }

  .post-card.deleting {
    opacity: 0.5;
    pointer-events: none;
  }

  /* ── Empty ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    gap: 16px;
    color: var(--muted);
    background: var(--surface);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
  }

  .empty-state svg { opacity: 0.4; }

  .empty-state p {
    font-size: 0.9rem;
    font-weight: 300;
  }

  .empty-state-link {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--surface);
    background: var(--ink);
    text-decoration: none;
    padding: 10px 20px;
    border-radius: var(--radius);
    transition: background 0.15s;
  }

  .empty-state-link:hover { background: #2e2e2b; }

  /* ── Pagination ── */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .page-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 14px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
    min-width: 38px;
  }

  .page-btn:hover:not(:disabled) {
    color: var(--ink);
    border-color: var(--ink);
    transform: translateY(-1px);
  }

  .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .page-btn.active {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }

  .page-info {
    font-size: 0.75rem;
    color: var(--muted);
    padding: 0 8px;
  }

  @media (max-width: 600px) {
    .post-card { flex-direction: column; }
    .post-card-image, .post-card-image-placeholder {
      width: 100%;
      height: 160px;
    }
    .post-card-read-time { margin-left: 0; }
  }
`;

const getId = (post) => post._id ?? post.id;

const readTime = (content) => {
  const words = content?.trim().split(/\s+/).length ?? 0;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.textContent || tmp.innerText || "";
};

function SkeletonList() {
  return (
    <div className="skeleton-list">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="skeleton-line" style={{ width: "20%", height: "10px" }} />
          <div className="skeleton-line" style={{ width: "70%", height: "20px", marginTop: "10px" }} />
          <div className="skeleton-line" style={{ width: "90%", marginTop: "10px" }} />
          <div className="skeleton-line" style={{ width: "60%", marginTop: "10px" }} />
        </div>
      ))}
    </div>
  );
}

function PostCard({ post, onDelete, deletingId }) {
  const [confirming, setConfirming] = useState(false);
  const currentUser = getLoggedInUser();
  const isOwner = currentUser && currentUser === post.author;
  const postId = getId(post);
  const isDeleting = deletingId === postId;

  return (
    <Link to={`/post/${postId}`} className={`post-card${isDeleting ? " deleting" : ""}`}>
      <div className="post-card-body">
        <div className="post-card-top">
          <span className="post-card-author">{post.author}</span>
          {post.createdAt && (
            <>
              <span className="post-card-dot" />
              <span className="post-card-date">{formatDate(post.createdAt)}</span>
            </>
          )}
        </div>

        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-excerpt">{stripHtml(post.content)}</p>

        <div className="post-card-footer">
          {post.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="post-card-tag">{tag}</span>
          ))}
          <span className="post-card-read-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {readTime(post.content)}
          </span>
        </div>

        {isOwner && (
          <div className="post-card-actions" onClick={(e) => e.preventDefault()}>
            {!confirming ? (
              <>
                <Link to={`/post/${postId}`} className="post-card-action-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Link>
                <button className="post-card-action-btn delete" onClick={() => setConfirming(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </>
            ) : (
              <div className="post-card-confirm" onClick={(e) => e.preventDefault()}>
                <span>Delete this post?</span>
                <button
                  className="confirm-yes"
                  onClick={() => {
                    setConfirming(false);
                    onDelete(postId);
                  }}
                >
                  Yes
                </button>
                <button className="confirm-no" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="post-card-image" />
      ) : (
        <div className="post-card-image-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
    </Link>
  );
}

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const PAGE_SIZE = 8;

  const loadPosts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await fetchPosts(page, PAGE_SIZE);
      setPosts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(0);
  }, [loadPosts]);

  const goToPage = (page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadPosts(page);
  };

  const deletePost = useCallback(async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    setError(null);
    try {
      await deletePostById(id);
      setPosts((prev) => prev.filter((p) => getId(p) !== id));
      setTotalElements((prev) => prev - 1);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) setError("Not authorised to delete this post.");
      else if (status === 404) setPosts((prev) => prev.filter((p) => getId(p) !== id));
      else setError("Couldn't delete that post. Try again.");
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  const pageButtons = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <style>{styles}</style>

      <div className="home-wrapper">
        <header className="home-header">
          <h1 className="home-title">
            Ideas worth
            <br />
            <em>reading.</em>
          </h1>
          <p className="home-subtitle">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <div className="home-meta">
            {!loading && (
              <span className="home-count">
                {totalElements} {totalElements === 1 ? "story" : "stories"}
              </span>
            )}
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button className="error-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading ? (
          <SkeletonList />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <p>No stories yet — be the first to write one.</p>
            <a href="/create" className="empty-state-link">Write a story</a>
          </div>
        ) : (
          <>
            <div className="post-list">
              {posts.map((post) => (
                <PostCard
                  key={getId(post)}
                  post={post}
                  onDelete={deletePost}
                  deletingId={deletingId}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Post pages">
                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  ←
                </button>
                {pageButtons().map((p) => (
                  <button
                    key={p}
                    className={`page-btn${p === currentPage ? " active" : ""}`}
                    onClick={() => goToPage(p)}
                  >
                    {p + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  →
                </button>
                <span className="page-info">{currentPage + 1} / {totalPages}</span>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Home;