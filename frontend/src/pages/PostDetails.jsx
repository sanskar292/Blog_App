import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostById, fetchComments, createComment, updatePostById, getLoggedInUser } from "../api";
import DOMPurify from "dompurify";
import TiptapEditor from "../components/TiptapEditor";
import CommentSection from "../components/CommentSection";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --surface: #fffdf8;
    --border: #e2ded4;
    --border-focus: #a8a49a;
    --radius: 8px;
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
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* ── Reading Progress Bar ── */
  .progress-container {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    height: 3px;
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
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    margin-bottom: 32px;
    transition: color 0.15s;
  }
  .pd-back:hover { color: var(--ink); }
  .pd-back svg { transition: transform 0.2s; }
  .pd-back:hover svg { transform: translateX(-3px); }

  /* ── Cover image ── */
  .pd-cover {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: var(--radius);
    margin-bottom: 32px;
    display: block;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  /* ── Post header ── */
  .pd-post { margin-bottom: 48px; }

  .pd-post-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  .pd-meta { display: flex; flex-direction: column; gap: 10px; }

  .pd-tags { display: flex; flex-wrap: wrap; gap: 6px; }

  .pd-tag {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: rgba(155, 150, 137, 0.15);
    color: var(--muted);
    padding: 4px 10px;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .pd-byline {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    color: var(--muted);
    font-weight: 300;
  }

  .pd-byline-author { font-weight: 600; color: var(--ink); }
  .pd-byline-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border); }

  .pd-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin: 20px 0 24px;
  }

  .pd-divider {
    width: 48px;
    height: 2px;
    background: var(--accent);
    margin-bottom: 28px;
    border: none;
  }

  .pd-content {
    font-size: 1.08rem;
    font-weight: 300;
    line-height: 1.9;
    color: #3a3a37;
  }

  .pd-content h1 {
    font-family: 'Instrument Serif', serif;
    font-size: 1.9rem;
    font-weight: 400;
    margin: 1.8em 0 0.6em;
    color: var(--ink);
  }

  .pd-content h2 {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem;
    font-weight: 400;
    margin: 1.6em 0 0.6em;
    color: var(--ink);
  }

  .pd-content p {
    margin: 1.2em 0;
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
    margin: 1.2em 0;
    padding-left: 2em;
  }

  .pd-content li {
    margin: 0.6em 0;
    line-height: 1.85;
  }

  .pd-content a {
    color: var(--accent);
    text-decoration: underline;
  }

  .pd-content blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1.2em;
    margin: 1.4em 0;
    font-style: italic;
    color: var(--muted);
  }

  .pd-content code {
    background: rgba(155, 150, 137, 0.15);
    padding: 3px 8px;
    border-radius: 4px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.9em;
  }

  /* Edit button */
  .pd-edit-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 7px 14px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
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
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 11px 14px;
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
    box-shadow: 0 0 0 3px rgba(168, 164, 154, 0.12);
  }

  .pd-edit-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: -6px;
  }

  .pd-edit-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .pd-edit-save {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--surface);
    border: none;
    border-radius: var(--radius);
    padding: 9px 20px;
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
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--surface);
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 9px 20px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .pd-edit-cancel:hover { color: var(--ink); border-color: var(--ink); }

  /* Tiptap Editor in Edit Form */
  .pd-edit-form .tiptap-editor-wrapper {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .pd-edit-form .tiptap-editor-wrapper:focus-within {
    border-color: var(--border-focus);
  }

  .pd-edit-form .tiptap-toolbar {
    background: var(--paper);
    border-bottom: 1px solid var(--border);
    padding: 10px 12px;
  }

  .pd-edit-form .tiptap-toolbar button {
    color: var(--muted);
  }

  .pd-edit-form .tiptap-toolbar button:hover:not(:disabled),
  .pd-edit-form .tiptap-toolbar button.is-active {
    color: var(--ink);
  }

  .pd-edit-form .tiptap-editor-content {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 300;
    color: var(--ink);
    background: var(--surface);
    min-height: 320px;
    padding: 16px 14px;
    line-height: 1.8;
  }


  .pd-save-success {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--success);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

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
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [loadError,   setLoadError]   = useState(null);
  const [submitError, setSubmitError] = useState(null);
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
              <span className="pd-edit-label">Content</span>
              <TiptapEditor
                value={editForm.content}
                onChange={(content) => setEditForm(f => ({ ...f, content }))}
                placeholder="Edit your story…"
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
          <CommentSection
            comments={comments}
            onSubmit={(commentText) => {
              setSubmitting(true);
              setSubmitError(null);
              createComment(id, commentText)
                .then(() => {
                  load();
                })
                .catch(() => {
                  setSubmitError("Couldn't post comment. Try again.");
                })
                .finally(() => {
                  setSubmitting(false);
                });
            }}
            loading={submitting}
            error={submitError}
            isLoggedIn={!!currentUser}
          />
        )}
      </div>
    </>
  );
}

export default PostDetails;