import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, deletePostById, getLoggedInUser } from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --surface: #fffdf8;
    --border: #e2ded4;
    --radius: 4px;
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
    max-width: 720px;
    margin: 0 auto;
    padding: 64px 24px 120px;
  }

  /* ── Header ── */
  .home-header {
    margin-bottom: 56px;
  }

  .home-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: var(--ink);
    margin-bottom: 12px;
  }

  .home-title em { font-style: italic; color: var(--accent); }

  .home-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border);
    padding-top: 14px;
    margin-top: 16px;
  }

  .home-count {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
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
    margin-bottom: 32px;
    font-size: 0.85rem;
    color: var(--accent);
  }

  .error-dismiss {
    margin-left: auto;
    cursor: pointer;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 1rem;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .error-dismiss:hover { opacity: 1; }

  /* ── Skeleton ── */
  .skeleton-list { display: flex; flex-direction: column; }

  .skeleton-item {
    padding: 28px 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skeleton-line {
    height: 14px;
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
  .post-list { display: flex; flex-direction: column; }

  /* ── Medium-style post row ── */
  .post-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    align-items: start;
    padding: 28px 0;
    border-bottom: 1px solid var(--border);
    text-decoration: none;
    color: inherit;
    animation: fadeUp 0.4s ease both;
    position: relative;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .post-row:first-child { border-top: 1px solid var(--border); }

  .post-row-body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }

  .post-row-top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .post-row-author {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ink);
    letter-spacing: 0.02em;
  }

  .post-row-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--muted);
    flex-shrink: 0;
  }

  .post-row-date {
    font-size: 0.75rem;
    font-weight: 300;
    color: var(--muted);
  }

  .post-row-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--ink);
    transition: color 0.15s;
  }

  .post-row:hover .post-row-title { color: var(--accent); }

  .post-row-excerpt {
    font-size: 0.875rem;
    font-weight: 300;
    line-height: 1.6;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-row-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
    flex-wrap: wrap;
  }

  .post-row-tag {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--border);
    color: var(--muted);
    padding: 3px 8px;
    border-radius: 2px;
  }

  .post-row-read-time {
    font-size: 0.72rem;
    font-weight: 300;
    color: var(--muted);
  }

  /* Cover image thumbnail */
  .post-row-thumb {
    width: 100px;
    height: 72px;
    object-fit: cover;
    border-radius: var(--radius);
    flex-shrink: 0;
    background: var(--border);
  }

  .post-row-thumb-placeholder {
    width: 100px;
    height: 72px;
    border-radius: var(--radius);
    background: var(--border);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    opacity: 0.5;
  }

  /* Owner actions */
  .post-row-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .post-row-delete {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0;
    transition: color 0.15s;
  }
  .post-row-delete:hover { color: var(--accent); }

  /* Confirm inline */
  .post-row-confirm {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--ink);
    margin-top: 8px;
  }

  .confirm-yes-sm {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 2px;
    padding: 4px 10px;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .confirm-yes-sm:hover { opacity: 0.85; }

  .confirm-no-sm {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 4px 10px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .confirm-no-sm:hover { color: var(--ink); border-color: var(--ink); }

  .post-row.deleting {
    opacity: 0.4;
    pointer-events: none;
  }

  /* ── Empty ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 0;
    gap: 12px;
    color: var(--muted);
  }

  .empty-state p {
    font-size: 0.875rem;
    font-weight: 300;
  }

  /* ── Pagination ── */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 48px;
  }

  .page-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 7px 14px;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .page-btn:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .page-btn.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

  .page-info {
    font-size: 0.75rem;
    color: var(--muted);
    padding: 0 8px;
  }

  @media (max-width: 500px) {
    .post-row { grid-template-columns: 1fr; }
    .post-row-thumb, .post-row-thumb-placeholder { display: none; }
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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function SkeletonList() {
  return (
    <div className="skeleton-list">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="skeleton-line" style={{ width: "20%", height: "10px" }} />
          <div className="skeleton-line" style={{ width: "70%", height: "20px" }} />
          <div className="skeleton-line" style={{ width: "90%" }} />
          <div className="skeleton-line" style={{ width: "60%" }} />
        </div>
      ))}
    </div>
  );
}

function PostRow({ post, onDelete, deletingId }) {
  const [confirming, setConfirming] = useState(false);
  const currentUser = getLoggedInUser();
  const isOwner = currentUser && currentUser === post.author;
  const postId = getId(post);
  const isDeleting = deletingId === postId;

  return (
    <div className={`post-row${isDeleting ? " deleting" : ""}`}>
      <div className="post-row-body">
        <div className="post-row-top">
          <span className="post-row-author">{post.author}</span>
          {post.createdAt && (
            <>
              <span className="post-row-dot" />
              <span className="post-row-date">{formatDate(post.createdAt)}</span>
            </>
          )}
        </div>

        <Link to={`/post/${postId}`} style={{ textDecoration: "none" }}>
          <h2 className="post-row-title">{post.title}</h2>
        </Link>

        <p className="post-row-excerpt">{post.content}</p>

        <div className="post-row-footer">
          {post.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="post-row-tag">{tag}</span>
          ))}
          <span className="post-row-read-time">{readTime(post.content)}</span>
        </div>

        {isOwner && !confirming && (
          <div className="post-row-actions">
            <Link
              to={`/post/${postId}`}
              style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
            >
              Edit
            </Link>
            <button className="post-row-delete" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </div>
        )}

        {confirming && (
          <div className="post-row-confirm">
            <span>Delete this post?</span>
            <button className="confirm-yes-sm" onClick={() => { setConfirming(false); onDelete(postId); }}>Delete</button>
            <button className="confirm-no-sm" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="post-row-thumb" />
      ) : (
        <div className="post-row-thumb-placeholder">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      )}
    </div>
  );
}

function Home() {
  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [deletingId,    setDeletingId]    = useState(null);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
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

  useEffect(() => { loadPosts(0); }, [loadPosts]);

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
      setPosts(prev => prev.filter(p => getId(p) !== id));
      setTotalElements(prev => prev - 1);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) setError("Not authorised to delete this post.");
      else if (status === 404) setPosts(prev => prev.filter(p => getId(p) !== id));
      else setError("Couldn't delete that post. Try again.");
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  const pageButtons = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end   = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <style>{styles}</style>

      <div className="home-wrapper">
        <header className="home-header">
          <h1 className="home-title">
            Ideas worth<br /><em>reading.</em>
          </h1>
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
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button className="error-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading ? (
          <SkeletonList />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p>No stories yet — be the first to write one.</p>
          </div>
        ) : (
          <>
            <div className="post-list">
              {posts.map((post, i) => (
                <PostRow
                  key={getId(post)}
                  post={post}
                  onDelete={deletePost}
                  deletingId={deletingId}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Post pages">
                <button className="page-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>←</button>
                {pageButtons().map(p => (
                  <button key={p} className={`page-btn${p === currentPage ? " active" : ""}`} onClick={() => goToPage(p)}>
                    {p + 1}
                  </button>
                ))}
                <button className="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>→</button>
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