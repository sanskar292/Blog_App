import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { deletePostById, getLoggedInUser } from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .profile-wrapper {
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
    --transition: 0.2s ease;

    max-width: 840px;
    margin: 0 auto;
    padding: 40px 24px 80px;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    text-align: left;
  }

  /* ── Profile Header ── */
  .profile-header {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 32px;
    border: 1px solid var(--border);
    margin-bottom: 32px;
    box-shadow: var(--shadow);
  }

  .profile-header-content {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .profile-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(145deg, var(--accent), #d4764e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: 400;
    color: #fff;
    flex-shrink: 0;
    font-family: 'Instrument Serif', serif;
    box-shadow: 0 3px 10px rgba(200, 80, 42, 0.2);
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-family: 'Instrument Serif', serif;
    font-size: 1.6rem;
    font-weight: 400;
    color: var(--ink);
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin-bottom: 2px;
  }

  .profile-handle {
    font-size: 0.8rem;
    color: var(--muted);
    font-weight: 400;
    margin-bottom: 10px;
  }

  .profile-stats {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .profile-stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink);
    line-height: 1;
  }

  .profile-stat-label {
    font-size: 0.78rem;
    color: var(--muted);
    font-weight: 400;
  }

  .profile-header-actions {
    flex-shrink: 0;
    align-self: flex-start;
  }

  .btn-write {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    background: var(--ink);
    border: none;
    border-radius: var(--radius);
    padding: 9px 18px;
    cursor: pointer;
    text-decoration: none;
    transition: all var(--transition);
    letter-spacing: 0.02em;
  }

  .btn-write:hover {
    background: #2e2e2b;
    transform: translateY(-1px);
    box-shadow: var(--shadow-hover);
  }

  /* ── Section Header ── */
  .profile-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .profile-section-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem;
    font-weight: 400;
    color: var(--ink);
  }

  .profile-section-count {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--muted);
    background: rgba(155, 150, 137, 0.1);
    padding: 5px 12px;
    border-radius: 20px;
  }

  /* ── Posts List ── */
  .profile-posts-list { display: flex; flex-direction: column; gap: 12px; }

  .post-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px;
    transition: all var(--transition);
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow);
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
    transform: translateY(-1px);
  }

  .post-card:hover::before { transform: scaleY(1); }

  .post-card.deleting {
    opacity: 0.4;
    pointer-events: none;
    transform: scale(0.98);
  }

  .post-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: start;
  }

  .post-row-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }

  .post-row-top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .post-row-author {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: rgba(200, 80, 42, 0.08);
    padding: 4px 10px;
    border-radius: 20px;
  }

  .post-row-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--border-dark);
    flex-shrink: 0;
  }

  .post-row-date {
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 400;
  }

  .post-row-read-time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 400;
  }

  .post-row-read-time svg { opacity: 0.5; }

  .post-row-title-link {
    text-decoration: none;
    color: inherit;
  }

  .post-row-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.35;
    color: var(--ink);
    transition: color 0.15s;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-row-title-link:hover .post-row-title { color: var(--accent); }

  .post-row-excerpt {
    font-size: 0.88rem;
    font-weight: 300;
    line-height: 1.7;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-row-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 2px;
  }

  .post-row-tag {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--border);
    color: var(--muted);
    padding: 4px 10px;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .post-card:hover .post-row-tag {
    background: var(--ink);
    color: var(--surface);
  }

  .post-row-thumb {
    width: 120px;
    height: 84px;
    object-fit: cover;
    border-radius: var(--radius);
    flex-shrink: 0;
    background: var(--border);
  }

  .post-row-thumb-placeholder {
    width: 120px;
    height: 84px;
    border-radius: var(--radius);
    background: var(--paper);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--border-dark);
  }

  /* ── Post Actions ── */
  .post-row-actions {
    display: flex;
    gap: 16px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }

  .post-row-edit, .post-row-delete {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s;
    text-decoration: none;
    color: var(--muted);
  }

  .post-row-edit:hover { color: var(--ink); }
  .post-row-delete:hover { color: var(--accent); }

  /* ── Confirm Delete ── */
  .post-row-confirm {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    padding: 12px 14px;
    background: #fef8f6;
    border: 1px solid #f3d5cb;
    border-radius: var(--radius);
  }

  .post-row-confirm > span {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--ink);
    margin-right: auto;
  }

  .confirm-yes {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .confirm-yes:hover { opacity: 0.9; transform: translateY(-1px); }

  .confirm-no {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .confirm-no:hover { color: var(--ink); border-color: var(--ink); }

  /* ── Empty State ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    gap: 16px;
    color: var(--muted);
    background: var(--surface);
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    text-align: center;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  .empty-icon svg { opacity: 0.5; }

  .empty-state h3 {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--ink);
  }

  .empty-state p {
    font-size: 0.88rem;
    font-weight: 300;
    max-width: 300px;
    line-height: 1.6;
  }

  .empty-state-link {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fff;
    background: var(--ink);
    text-decoration: none;
    padding: 10px 20px;
    border-radius: var(--radius);
    transition: all var(--transition);
    margin-top: 8px;
  }
  .empty-state-link:hover { background: #2e2e2b; transform: translateY(-1px); }

  /* ── Pagination ── */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 32px;
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
    text-align: center;
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
    font-weight: 600;
  }

  .page-info {
    font-size: 0.75rem;
    color: var(--muted);
    padding: 0 8px;
  }

  /* ── Error Banner ── */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fef2ef;
    border: 1px solid #f0c4b7;
    border-radius: var(--radius);
    padding: 14px 18px;
    margin-bottom: 24px;
    font-size: 0.85rem;
    color: var(--accent);
  }

  .error-banner svg { flex-shrink: 0; }

  .error-text {
    flex: 1;
    line-height: 1.5;
  }

  .error-retry {
    flex-shrink: 0;
    cursor: pointer;
    background: none;
    border: 1px solid var(--accent);
    color: var(--accent);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: var(--radius);
    transition: all var(--transition);
  }
  .error-retry:hover { background: var(--accent); color: #fff; }

  /* ── Loading Skeleton ── */
  .profile-loading {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .profile-loading-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 32px;
    background: var(--surface);
    border-radius: var(--radius);
    margin-bottom: 28px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .skeleton-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: profileShimmer 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }

  .skeleton-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: profileShimmer 1.6s ease-in-out infinite;
    border-radius: 4px;
  }

  .skeleton-list { display: flex; flex-direction: column; gap: 12px; }

  .skeleton-item {
    padding: 22px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: var(--shadow);
  }

  .skeleton-row {
    display: flex;
    gap: 12px;
  }

  @keyframes profileShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .profile-wrapper { padding: 24px 16px 64px; }
    .profile-header { padding: 24px 20px; }
    .profile-header-content {
      flex-direction: column;
      text-align: center;
    }
    .profile-stats { justify-content: center; }
    .profile-header-actions { width: 100%; }
    .btn-write { width: 100%; justify-content: center; }
    .post-row { grid-template-columns: 1fr; }
    .post-row-thumb, .post-row-thumb-placeholder { display: none; }
    .post-card { padding: 18px; }
  }
`;

/* ── Helpers ── */
const getId = (post) => post._id ?? post.id;

const readTime = (content) => {
  const words = content?.trim().split(/\s+/).length ?? 0;
  return `${Math.max(1, Math.round(words / 200))} min read`;
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
  const el = document.createElement("div");
  el.innerHTML = html || "";
  return el.textContent || el.innerText || "";
};

/* ── Post Row ── */
function PostRow({ post, onDelete, deletingId }) {
  const [confirming, setConfirming] = useState(false);
  const postId = getId(post);
  const isDeleting = deletingId === postId;

  return (
    <article className={`post-card${isDeleting ? " deleting" : ""}`}>
      <div className="post-row">
        <div className="post-row-body">
          <div className="post-row-top">
            <span className="post-row-author">{post.author}</span>
            {post.createdAt && (
              <>
                <span className="post-row-dot" />
                <span className="post-row-date">{formatDate(post.createdAt)}</span>
              </>
            )}
            {post.content && (
              <>
                <span className="post-row-dot" />
                <span className="post-row-read-time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {readTime(post.content)}
                </span>
              </>
            )}
          </div>

          <Link to={`/post/${postId}`} className="post-row-title-link">
            <h2 className="post-row-title">{post.title}</h2>
          </Link>

          <p className="post-row-excerpt">{stripHtml(post.content)}</p>

          {post.tags?.length > 0 && (
            <div className="post-row-footer">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="post-row-tag">{tag}</span>
              ))}
            </div>
          )}

          {!confirming ? (
            <div className="post-row-actions">
              <Link to={`/edit/${postId}`} className="post-row-edit">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </Link>
              <button className="post-row-delete" onClick={() => setConfirming(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          ) : (
            <div className="post-row-confirm">
              <span>Delete this post?</span>
              <button className="confirm-no" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="confirm-yes" onClick={() => { setConfirming(false); onDelete(postId); }}>Delete</button>
            </div>
          )}
        </div>

        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="post-row-thumb" />
        ) : (
          <div className="post-row-thumb-placeholder">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>
    </article>
  );
}

/* ── Skeleton Loader ── */
function ProfileSkeleton() {
  return (
    <div className="profile-loading">
      <div className="profile-loading-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-details">
          <div className="skeleton-line" style={{ width: "180px", height: "26px" }} />
          <div className="skeleton-line" style={{ width: "120px", height: "14px" }} />
          <div className="skeleton-line" style={{ width: "80px", height: "14px" }} />
        </div>
      </div>

      <div className="skeleton-line" style={{ width: "140px", height: "20px", marginBottom: "16px" }} />

      <div className="skeleton-list">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-item">
            <div className="skeleton-row">
              <div className="skeleton-line" style={{ width: "80px", height: "12px" }} />
              <div className="skeleton-line" style={{ width: "70px", height: "12px" }} />
            </div>
            <div className="skeleton-line" style={{ width: "75%", height: "20px" }} />
            <div className="skeleton-line" style={{ width: "100%" }} />
            <div className="skeleton-line" style={{ width: "60%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Profile Component ── */
function Profile() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = getLoggedInUser();

  const PAGE_SIZE = 5;

  const loadProfile = useCallback(async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      setError(null);
      const { data } = await API.get("/users/profile");
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.response?.data?.message || err.response?.data || "Failed to load profile");
    }
  }, [currentUser, navigate]);

  const loadPosts = useCallback(async (page = 0) => {
    if (!currentUser) return;
    try {
      setError(null);
      const { data } = await API.get(`/users/${currentUser}/posts?page=${page}&size=${PAGE_SIZE}`);
      setPosts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError(err.response?.data?.message || err.response?.data || "Failed to load posts");
    }
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadProfile();
      await loadPosts(0);
      setLoading(false);
    })();
  }, [loadProfile, loadPosts]);

  const goToPage = (page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadPosts(page);
  };

  const deletePost = useCallback(async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deletePostById(id);
      setPosts((prev) => prev.filter((p) => getId(p) !== id));
      if (profile) {
        setProfile((prev) => ({
          ...prev,
          postsCount: Math.max(0, (prev.postsCount || 1) - 1),
        }));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, profile]);

  const pageButtons = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="profile-wrapper">
          <ProfileSkeleton />
        </div>
      </>
    );
  }

  if (!currentUser) return null;

  return (
    <>
      <style>{styles}</style>

      <div className="profile-wrapper">
        {error && (
          <div className="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="error-text">
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
            <button className="error-retry" onClick={() => { setError(null); loadProfile(); loadPosts(currentPage); }}>
              Retry
            </button>
          </div>
        )}

        <header className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {profile?.username?.charAt(0).toUpperCase() || "?"}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{profile?.username || "User"}</h1>
              <p className="profile-handle">@{(profile?.username || "user").toLowerCase()}</p>
              <div className="profile-stats">
                <span className="profile-stat-value">{profile?.postsCount ?? posts.length}</span>
                <span className="profile-stat-label">
                  {(profile?.postsCount ?? posts.length) === 1 ? "story" : "stories"}
                </span>
              </div>
            </div>

            <div className="profile-header-actions">
              <Link to="/create" className="btn-write">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Story
              </Link>
            </div>
          </div>
        </header>

        <div className="profile-section-header">
          <h2 className="profile-section-title">Your Stories</h2>
          <span className="profile-section-count">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3>No stories yet</h3>
            <p>Start sharing your thoughts and ideas with the world.</p>
            <Link to="/create" className="empty-state-link">Write your first story</Link>
          </div>
        ) : (
          <>
            <div className="profile-posts-list">
              {posts.map((post) => (
                <PostRow
                  key={getId(post)}
                  post={post}
                  onDelete={deletePost}
                  deletingId={deletingId}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Page navigation">
                <button className="page-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page">←</button>
                {pageButtons().map((p) => (
                  <button key={p} className={`page-btn${p === currentPage ? " active" : ""}`} onClick={() => goToPage(p)} aria-current={p === currentPage ? "page" : undefined}>
                    {p + 1}
                  </button>
                ))}
                <button className="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1} aria-label="Next page">→</button>
                <span className="page-info">{currentPage + 1} / {totalPages}</span>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Profile;