import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostById, fetchComments, createComment, updatePostById, getLoggedInUser } from "../api";
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
    --border-focus: #a8a49a;
    --radius: 4px;
    --success: #3a7d44;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
  }

  .pd-wrapper {
    max-width: 680px;
    margin: 0 auto;
    padding: 56px 24px 120px;
  }

  /* ── Reading Progress Bar ── */
  .progress-container {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    height: 4px;
    background: transparent;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #e0a890);
    width: 0%;
    transition: width 0.1s ease-out;
  }

  /* ── Back ── */
  .pd-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    margin-bottom: 40px;
    transition: color 0.15s;
  }
  .pd-back:hover { color: var(--ink); }
  .pd-back svg { transition: transform 0.2s; }
  .pd-back:hover svg { transform: translateX(-3px); }

  /* ── Cover image ── */
  .pd-cover {
    width: 100%;
    max-height: 380px;
    object-fit: cover;
    border-radius: var(--radius);
    margin-bottom: 40px;
    display: block;
  }

  /* ── Post header ── */
  .pd-post { margin-bottom: 56px; }

  .pd-post-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  .pd-meta { display: flex; flex-direction: column; gap: 6px; }

  .pd-tags { display: flex; flex-wrap: wrap; gap: 6px; }

  .pd-tag {
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--border);
    color: var(--muted);
    padding: 3px 8px;
    border-radius: 2px;
  }

  .pd-byline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    color: var(--muted);
    font-weight: 300;
  }

  .pd-byline-author { font-weight: 500; color: var(--ink); }
  .pd-byline-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }

  .pd-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 28px;
  }

  .pd-divider {
    width: 40px;
    height: 2px;
    background: var(--accent);
    margin-bottom: 28px;
    border: none;
  }

  .pd-content {
    font-size: 1.05rem;
    font-weight: 300;
    line-height: 1.85;
    color: #3a3a37;
  }

  .pd-content h1 {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    margin: 1.5em 0 0.5em;
    color: var(--ink);
  }

  .pd-content h2 {
    font-family: 'Instrument Serif', serif;
    font-size: 1.6rem;
    font-weight: 400;
    margin: 1.5em 0 0.5em;
    color: var(--ink);
  }

  .pd-content p {
    margin: 1em 0;
  }

  .pd-content strong {
    font-weight: 500;
    color: var(--ink);
  }

  .pd-content em {
    font-style: italic;
  }

  .pd-content ul,
  .pd-content ol {
    margin: 1em 0;
    padding-left: 2em;
  }

  .pd-content li {
    margin: 0.5em 0;
    line-height: 1.8;
  }

  .pd-content a {
    color: var(--accent);
    text-decoration: underline;
  }

  .pd-content blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: var(--muted);
  }

  .pd-content code {
    background: var(--code-bg, #f4f3ec);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: var(--mono, ui-monospace, Consolas, monospace);
    font-size: 0.9em;
  }

  /* Edit button */
  .pd-edit-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 12px;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .pd-edit-btn:hover { color: var(--ink); border-color: var(--ink); background: var(--paper); }

  /* Edit form */
  .pd-edit-form { display: flex; flex-direction: column; gap: 14px; animation: slideUp 0.2s ease; }

  .pd-edit-input,
  .pd-edit-textarea,
  .pd-edit-url {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 14px;
    outline: none;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .pd-edit-input {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }

  .pd-edit-textarea {
    min-height: 200px;
    resize: vertical;
    line-height: 1.8;
  }

  .pd-edit-input:focus,
  .pd-edit-textarea:focus,
  .pd-edit-url:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(168,164,154,0.15);
  }

  .pd-edit-label {
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: -8px;
  }

  .pd-edit-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .pd-edit-save {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    border: none;
    border-radius: var(--radius);
    padding: 8px 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: background 0.15s, opacity 0.15s;
  }
  .pd-edit-save:hover:not(:disabled) { background: #2e2e2b; }
  .pd-edit-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .pd-edit-cancel {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: none;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 20px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .pd-edit-cancel:hover { color: var(--ink); border-color: var(--ink); }

  .pd-save-success {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--success);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* ── Comments ── */
  .pd-section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1.5px solid var(--ink);
    padding-bottom: 12px;
    margin-bottom: 24px;
  }

  .pd-section-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem;
    font-weight: 400;
    letter-spacing: -0.01em;
  }

  .pd-comment-count {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .pd-comments { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }

  .pd-comment {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    animation: slideUp 0.3s ease both;
  }

  .pd-comment-author {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .pd-comment-text {
    font-size: 0.9rem;
    font-weight: 300;
    line-height: 1.65;
    color: var(--ink);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pd-no-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
    gap: 8px;
    color: var(--muted);
    margin-bottom: 32px;
  }
  .pd-no-comments svg { opacity: 0.3; }
  .pd-no-comments span { font-size: 0.83rem; }

  /* Comment form */
  .pd-form { display: flex; flex-direction: column; gap: 10px; }

  .pd-textarea {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 300;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    min-height: 88px;
    resize: none;
    outline: none;
    line-height: 1.65;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  .pd-textarea::placeholder { color: #c2bdb4; }
  .pd-textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(168,164,154,0.15); }
  .pd-textarea.has-error { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,80,42,0.1); }

  .pd-form-footer { display: flex; align-items: center; justify-content: space-between; }

  .pd-form-hint { font-size: 0.75rem; font-weight: 300; color: var(--muted); }
  .pd-form-hint.error { color: var(--accent); }

  .pd-submit {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    border: none;
    border-radius: var(--radius);
    padding: 9px 22px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
  }
  .pd-submit:hover:not(:disabled) { background: #2e2e2b; }
  .pd-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .pd-spinner {
    width: 12px; height: 12px;
    border: 2px solid rgba(245,242,235,0.3);
    border-top-color: var(--paper);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Skeleton */
  .pd-skeleton-title {
    height: 48px; width: 70%;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: var(--radius);
    margin-bottom: 24px;
  }
  .pd-skeleton-line {
    height: 14px;
    background: linear-gradient(90deg, var(--border) 25%, #ede9e0 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: var(--radius);
    margin-bottom: 10px;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .pd-error {
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
`;

const COMMENT_MAX = 500;

const readTime = (content) => {
  const words = content?.trim().split(/\s+/).length ?? 0;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

function Skeleton() {
  return (
    <div>
      <div className="pd-skeleton-title" />
      <div className="pd-skeleton-line" style={{ width: "95%" }} />
      <div className="pd-skeleton-line" style={{ width: "88%" }} />
      <div className="pd-skeleton-line" style={{ width: "72%" }} />
    </div>
  );
}

function PostDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [post,        setPost]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [text,        setText]        = useState("");
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [loadError,   setLoadError]   = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [fieldError,  setFieldError]  = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [editing,     setEditing]     = useState(false);
  const [editForm,    setEditForm]    = useState({ title: "", content: "", coverImage: "" });
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const postRes = await fetchPostById(id);
      setPost(postRes.data);
    } catch {
      setLoadError("Failed to load post. Please refresh.");
    }
    try {
      const commentRes = await fetchComments(id);
      setComments(commentRes.data);
    } catch {
      console.error("Comments failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentUser = getLoggedInUser();
  const isOwner     = currentUser && post && currentUser === post.author;

  const openEdit = () => {
    setEditForm({ title: post.title, content: post.content, coverImage: post.coverImage ?? "" });
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveError(null); };

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      setSaveError("Title and content can't be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { data } = await updatePostById(id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        coverImage: editForm.coverImage.trim() || null,
        tags: post.tags ?? [],
      });
      setPost(data);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      const status = err?.response?.status;
      setSaveError(status === 403
        ? "You don't have permission to edit this post."
        : "Failed to save changes. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const addComment = async () => {
    if (!text.trim()) { setFieldError("Comment can't be empty."); return; }
    if (text.length > COMMENT_MAX) { setFieldError(`Keep it under ${COMMENT_MAX} characters.`); return; }
    setFieldError(null);
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createComment(id, text.trim());
      setText("");
      setComments(prev => [...prev, { id: Date.now(), content: text.trim(), author: currentUser ?? "you" }]);
    } catch {
      setSubmitError("Couldn't post comment. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment();
  };

  const nearLimit = text.length > COMMENT_MAX * 0.85;

  return (
    <>
      <style>{styles}</style>

      <div className="pd-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
        </div>

        <a href="/" className="pd-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          All stories
        </a>

        {loadError && (
          <div className="pd-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {loadError}
          </div>
        )}

        <section className="pd-post">
          {loading ? <Skeleton /> : editing ? (

            <div className="pd-edit-form">
              <span className="pd-edit-label">Cover image URL</span>
              <input
                className="pd-edit-url"
                value={editForm.coverImage}
                onChange={e => setEditForm(f => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://..."
              />
              <input
                className="pd-edit-input"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Post title"
              />
              <textarea
                className="pd-edit-textarea"
                value={editForm.content}
                onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Post content"
              />
              {saveError && (
                <div className="pd-error" role="alert" style={{ marginBottom: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {saveError}
                </div>
              )}
              <div className="pd-edit-actions">
                <button className="pd-edit-cancel" onClick={cancelEdit}>Cancel</button>
                <button className="pd-edit-save" onClick={saveEdit} disabled={saving}>
                  {saving ? <><span className="pd-spinner" /> Saving…</> : (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Save</>
                  )}
                </button>
              </div>
            </div>

          ) : (
            <>
              {/* Cover image */}
              {post?.coverImage && (
                <img src={post.coverImage} alt={post.title} className="pd-cover" />
              )}

              <div className="pd-post-top">
                <div className="pd-meta">
                  {post?.tags?.length > 0 && (
                    <div className="pd-tags">
                      {post.tags.map(tag => <span key={tag} className="pd-tag">{tag}</span>)}
                    </div>
                  )}
                  <div className="pd-byline">
                    <span className="pd-byline-author">{post?.author}</span>
                    <span className="pd-byline-dot" />
                    <span>{formatDate(post?.createdAt)}</span>
                    <span className="pd-byline-dot" />
                    <span>{readTime(post?.content)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {saveSuccess && (
                    <span className="pd-save-success">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Saved
                    </span>
                  )}
                  {isOwner && (
                    <button className="pd-edit-btn" onClick={openEdit}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <h1 className="pd-title">{post?.title}</h1>
              <hr className="pd-divider" />
              <div
                className="pd-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content || "") }}
              />
            </>
          )}
        </section>

        {!loading && !editing && (
          <>
            <div className="pd-section-header">
              <h2 className="pd-section-title">Comments</h2>
              <span className="pd-comment-count">
                {comments.length} {comments.length === 1 ? "reply" : "replies"}
              </span>
            </div>

            <div className="pd-comments">
              {comments.length === 0 ? (
                <div className="pd-no-comments">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>No comments yet — start the conversation.</span>
                </div>
              ) : (
                comments.map((c, i) => (
                  <div key={c.id ?? c._id} className="pd-comment" style={{ animationDelay: `${i * 0.04}s` }}>
                    {c.author && <span className="pd-comment-author">{c.author}</span>}
                    <p className="pd-comment-text">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {submitError && (
              <div className="pd-error" role="alert" style={{ marginBottom: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {submitError}
              </div>
            )}

            <div className="pd-form">
              <textarea
                className={`pd-textarea${fieldError ? " has-error" : ""}`}
                placeholder="Leave a comment… (⌘ + Enter to submit)"
                value={text}
                onChange={e => { setText(e.target.value); if (fieldError) setFieldError(null); }}
                onKeyDown={handleKey}
                maxLength={COMMENT_MAX + 30}
                aria-label="Comment text"
              />
              <div className="pd-form-footer">
                <span className={`pd-form-hint${fieldError ? " error" : ""}`}>
                  {fieldError ? fieldError : nearLimit ? `${text.length} / ${COMMENT_MAX}` : "⌘ + Enter to submit"}
                </span>
                <button className="pd-submit" onClick={addComment} disabled={submitting} aria-busy={submitting}>
                  {submitting ? <><span className="pd-spinner" /> Posting…</> : "Comment"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default PostDetails;