import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { deletePostById, getLoggedInUser } from "../api";
import DOMPurify from "dompurify";

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

  .profile-wrapper {
    max-width: 720px;
    margin: 0 auto;
    padding: 64px 24px 120px;
    color: var(--ink);
    background: var(--paper);
    min-height: 100vh;
  }

  /* ── Profile Header ── */
  .profile-header {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 32px;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #e0a890);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    color: var(--paper);
    font-weight: 400;
    flex-shrink: 0;
  }

  .profile-info {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .profile-name {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: #1a1a18;
    line-height: 1;
  }

  .profile-stats {
    display: flex;
    gap: 24px;
  }

  .profile-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .profile-stat-value {
    font-size: 1.25rem;
    font-weight: 500;
    color: #1a1a18;
    line-height: 1;
  }

  .profile-stat-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── Profile Nav ── */
  .profile-nav {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  .profile-tab {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    border: none;
    color: var(--muted);
    padding: 8px 16px;
    cursor: pointer;
    border-radius: var(--radius);
    transition: color 0.15s, background 0.15s;
  }
  .profile-tab:hover { color: var(--ink); background: var(--border); }
  .profile-tab.active { color: var(--ink); background: var(--border); }

  /* ── Posts List ── */
  .profile-posts-list { display: flex; flex-direction: column; }

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

  .post-row-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .post-row-edit, .post-row-delete {
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
    text-decoration: none;
  }
  .post-row-edit:hover, .post-row-delete:hover { color: var(--accent); }

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

  /* ── Empty State ── */
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

  .empty-state-link {
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
    margin-top: 8px;
    transition: opacity 0.15s;
  }
  .empty-state-link:hover { opacity: 0.8; }

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

  /* ── Loading ── */
  .profile-loading {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .profile-loading-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
  }

  .skeleton-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .skeleton-name {
    height: 32px;
    width: 200px;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (max-width: 500px) {
    .post-row { grid-template-columns: 1fr; }
    .post-row-thumb, .post-row-thumb-placeholder { display: none; }
    .profile-info { flex-direction: column; align-items: flex-start; }
  }

  /* ── Skeleton Loading ── */
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

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.textContent || tmp.innerText || "";
};

function PostRow({ post, onDelete, deletingId }) {
  const [confirming, setConfirming] = useState(false);
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

        <p className="post-row-excerpt">{stripHtml(post.content)}</p>

        <div className="post-row-footer">
          {post.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="post-row-tag">{tag}</span>
          ))}
          <span className="post-row-read-time">{readTime(post.content)}</span>
        </div>

        {!confirming && (
          <div className="post-row-actions">
            <Link to={`/post/${postId}`} className="post-row-edit">Edit</Link>
            <button className="post-row-delete" onClick={() => setConfirming(true)}>Delete</button>
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

function ProfileLoading() {
  return (
    <div className="profile-loading">
      <div className="profile-loading-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-name" />
      </div>
      {[1, 2, 3].map(i => (
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
      const response = await API.get("/users/profile");
      console.log('Profile response:', response);
      console.log('Profile data:', response.data);
      setProfile(response.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      console.error('Error response:', err.response);
      setError(err.response?.data || "Failed to load profile");
    }
  }, [currentUser, navigate]);

  const loadPosts = useCallback(async (page = 0) => {
    if (!currentUser) return;
    try {
      setError(null);
      const response = await API.get(`/users/${currentUser}/posts?page=${page}&size=${PAGE_SIZE}`);
      console.log('Posts response:', response);
      console.log('Posts data:', response.data);
      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(response.data.number || 0);
    } catch (err) {
      console.error("Failed to load posts:", err);
      console.error('Error response:', err.response);
      setError(err.response?.data || "Failed to load posts");
    }
  }, [currentUser]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadProfile();
      await loadPosts(0);
      setLoading(false);
    };
    init();
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
      setPosts(prev => prev.filter(p => getId(p) !== id));
      if (profile) {
        setProfile(prev => ({ ...prev, postsCount: (prev.postsCount || 1) - 1 }));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
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
          <ProfileLoading />
        </div>
      </>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <style>{styles}</style>

      <div className="profile-wrapper">
        {error && (
          <div className="error-banner" role="alert" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#fef2ef',
            border: '1px solid #f5c6ba',
            borderRadius: '4px',
            padding: '12px 16px',
            marginBottom: '32px',
            fontSize: '0.85rem',
            color: '#c8502a'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={() => { setLoading(true); loadProfile(); loadPosts(); setLoading(false); }} 
              style={{ marginLeft: 'auto', cursor: 'pointer', background: 'none', border: 'none', color: '#c8502a', fontSize: '1rem', opacity: 0.7 }}>
              Retry
            </button>
          </div>
        )}

        <header className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{profile?.username || "User"}</h1>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-value">{profile?.postsCount || 0}</span>
                  <span className="profile-stat-label">Stories</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p>You haven't written any stories yet.</p>
            <Link to="/create" className="empty-state-link">Write your first story</Link>
          </div>
        ) : (
          <>
            <div className="profile-posts-list">
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

export default Profile;
