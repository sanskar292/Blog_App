import { useEffect, useState, useCallback } from "react";
import { fetchPosts, deletePostById } from "../api";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";

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
    max-width: 860px;
    margin: 0 auto;
    padding: 64px 24px 120px;
  }

  .home-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1.5px solid var(--ink);
    padding-bottom: 16px;
    margin-bottom: 48px;
  }

  .home-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .home-title em { font-style: italic; color: var(--accent); }

  .post-count {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .form-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 48px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .state-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 12px;
    color: var(--muted);
  }

  .state-icon { width: 40px; height: 40px; opacity: 0.35; }

  .state-label {
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.04em;
  }

  .skeleton-grid { display: grid; gap: 16px; }

  .skeleton-card {
    height: 120px;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: var(--radius);
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .posts-grid { display: grid; gap: 16px; }

  .post-item { animation: slideUp 0.35s ease both; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .post-item.deleting {
    opacity: 0.4;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

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
    animation: slideUp 0.3s ease;
  }

  .error-dismiss {
    margin-left: auto;
    cursor: pointer;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 1rem;
    line-height: 1;
    padding: 0 4px;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .error-dismiss:hover { opacity: 1; }

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

  .page-btn:hover:not(:disabled) {
    color: var(--ink);
    border-color: var(--ink);
  }

  .page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .page-btn.active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .page-info {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--muted);
    padding: 0 8px;
  }
`;

const getId = (post) => post._id ?? post.id;

function SkeletonLoader() {
  return (
    <div className="skeleton-grid">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="state-wrapper">
      <svg className="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 11H5M19 11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2M19 11V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
      </svg>
      <span className="state-label">No posts yet — write the first one.</span>
    </div>
  );
}

function Home() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination state — Spring returns these in the Page object
  const [currentPage,  setCurrentPage]  = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const PAGE_SIZE = 5;

  const loadPosts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await fetchPosts(page, PAGE_SIZE);
      // Spring Page object: { content: [...], totalPages, totalElements, number }
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
      if (status === 401 || status === 403) {
        setError("Not authorised to delete this post.");
      } else if (status === 404) {
        setPosts(prev => prev.filter(p => getId(p) !== id));
      } else {
        setError("Couldn't delete that post. Try again.");
      }
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  // Page number buttons — show max 5 pages around current
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
          <h1 className="home-title">Latest <em>posts</em></h1>
          {!loading && (
            <span className="post-count">
              {totalElements} {totalElements === 1 ? "entry" : "entries"}
            </span>
          )}
        </header>

        <section className="form-section">
          <PostForm refresh={() => loadPosts(0)} />
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button className="error-dismiss" onClick={() => setError(null)} aria-label="Dismiss">×</button>
          </div>
        )}

        {loading ? (
          <SkeletonLoader />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post, i) => (
                <div
                  key={getId(post)}
                  className={`post-item${deletingId === getId(post) ? " deleting" : ""}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <PostCard post={post} onDelete={deletePost} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Post pages">
                {/* Prev */}
                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >
                  ←
                </button>

                {/* Page numbers */}
                {pageButtons().map(p => (
                  <button
                    key={p}
                    className={`page-btn${p === currentPage ? " active" : ""}`}
                    onClick={() => goToPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                  >
                    {p + 1}
                  </button>
                ))}

                {/* Next */}
                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  aria-label="Next page"
                >
                  →
                </button>

                <span className="page-info">
                  {currentPage + 1} / {totalPages}
                </span>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Home;