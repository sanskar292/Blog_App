import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPoemById, updatePoemById, getLoggedInUser } from "../../api";
import DOMPurify from "dompurify";
import TiptapEditor from "../../components/TiptapEditor";

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
    --poetry-gold-light: rgba(184, 152, 92, 0.2);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--poetry-paper);
    color: var(--poetry-ink);
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
  }

  .poetry-details-wrapper {
    max-width: 680px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  /* ── Back ── */
  .poetry-details-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--poetry-muted);
    text-decoration: none;
    margin-bottom: 40px;
    transition: color 0.2s ease;
  }
  .poetry-details-back:hover { color: var(--poetry-accent); }
  .poetry-details-back svg { transition: transform 0.2s ease; }
  .poetry-details-back:hover svg { transform: translateX(-3px); }

  /* ── Poem header ── */
  .poetry-details-poem { margin-bottom: 56px; }

  .poetry-details-post-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  .poetry-details-meta {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .poetry-details-mood-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--poetry-accent);
    background: rgba(124, 92, 184, 0.08);
    padding: 5px 14px;
    border-radius: 20px;
    width: fit-content;
  }

  .poetry-details-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .poetry-details-tag {
    font-size: 0.6rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--poetry-muted);
    background: rgba(139, 134, 153, 0.08);
    padding: 4px 11px;
    border-radius: 2px;
    transition: all 0.2s ease;
  }

  .poetry-details-byline {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.75rem;
    color: var(--poetry-muted);
    font-weight: 200;
    letter-spacing: 0.03em;
  }

  .poetry-details-byline-author {
    font-weight: 400;
    color: var(--poetry-ink);
  }

  .poetry-details-byline-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--poetry-gold);
  }

  .poetry-details-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 300;
    font-style: italic;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--poetry-ink);
    margin: 24px 0 20px;
  }

  .poetry-details-divider {
    width: 56px;
    height: 1.5px;
    background: linear-gradient(90deg, var(--poetry-gold), transparent);
    margin-bottom: 32px;
    border: none;
  }

  .poetry-details-content {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.95rem;
    font-weight: 200;
    line-height: 2.2;
    color: var(--poetry-ink);
    letter-spacing: 0.01em;
  }

  .poetry-details-content strong,
  .poetry-details-content b {
    font-weight: 500;
    color: var(--poetry-ink);
  }

  .poetry-details-content em,
  .poetry-details-content i {
    font-style: italic;
  }

  .poetry-details-content s {
    color: var(--poetry-muted);
  }

  .poetry-details-content h1,
  .poetry-details-content h2,
  .poetry-details-content h3 {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    color: var(--poetry-ink);
    margin: 1em 0 0.6em;
    line-height: 1.3;
  }

  .poetry-details-content h1 { font-size: 1.8rem; }
  .poetry-details-content h2 { font-size: 1.5rem; }
  .poetry-details-content h3 { font-size: 1.2rem; }

  .poetry-details-content blockquote {
    border-left: 3px solid var(--poetry-accent);
    padding-left: 1.2em;
    margin: 1.4em 0;
    font-style: italic;
    color: var(--poetry-muted);
  }

  .poetry-details-content code {
    background: rgba(124, 92, 184, 0.1);
    padding: 3px 8px;
    border-radius: 2px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.85em;
    color: var(--poetry-accent);
  }

  .poetry-details-content pre {
    background: rgba(124, 92, 184, 0.08);
    border-radius: var(--poetry-radius);
    padding: 12px 16px;
    overflow-x: auto;
    margin: 1.2em 0;
    font-size: 0.85rem;
    line-height: 1.8;
  }

  .poetry-details-content pre code {
    background: transparent;
    padding: 0;
  }

  .poetry-details-content ul,
  .poetry-details-content ol {
    margin: 1em 0;
    padding-left: 2em;
  }

  .poetry-details-content li {
    margin: 0.5em 0;
  }

  .poetry-details-content a {
    color: var(--poetry-accent);
    text-decoration: underline;
  }

  .poetry-details-content p {
    margin: 1.2em 0;
  }

  /* Edit button */
  .poetry-details-edit-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--poetry-surface);
    border: 1px solid var(--poetry-border);
    border-radius: var(--poetry-radius);
    padding: 7px 14px;
    color: var(--poetry-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .poetry-details-edit-btn:hover {
    color: var(--poetry-accent);
    border-color: var(--poetry-accent);
    background: rgba(124, 92, 184, 0.05);
  }

  /* Edit form */
  .poetry-details-edit-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: poetry-fade-in 0.25s ease;
  }

  @keyframes poetry-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .poetry-details-edit-input {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-style: italic;
    letter-spacing: -0.01em;
  }

  .poetry-details-edit-input:focus {
    border-color: var(--poetry-accent);
    box-shadow: 0 0 0 3px rgba(124, 92, 184, 0.1);
  }

  /* Tiptap Editor in Poetry Edit Form */
  .poetry-details-edit-form .tiptap-editor-wrapper {
    border: 1px solid var(--poetry-border);
    border-radius: var(--poetry-radius);
    overflow: hidden;
    transition: border-color 0.2s ease;
  }

  .poetry-details-edit-form .tiptap-editor-wrapper:focus-within {
    border-color: var(--poetry-accent);
  }

  .poetry-details-edit-form .tiptap-toolbar {
    background: var(--poetry-paper);
    border-bottom: 1px solid var(--poetry-border);
    padding: 10px 12px;
  }

  .poetry-details-edit-form .tiptap-toolbar button {
    color: var(--poetry-muted);
  }

  .poetry-details-edit-form .tiptap-toolbar button:hover:not(:disabled),
  .poetry-details-edit-form .tiptap-toolbar button.is-active {
    color: var(--poetry-accent);
  }

  .poetry-details-edit-form .tiptap-editor-content {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.95rem;
    font-weight: 200;
    color: var(--poetry-ink);
    background: var(--poetry-surface);
    min-height: 280px;
    padding: 16px 14px;
    line-height: 2;
  }

  .poetry-details-edit-label {
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--poetry-muted);
    margin-bottom: -8px;
  }

  .poetry-details-edit-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .poetry-details-edit-save {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--poetry-accent), #5c4a8a);
    color: var(--poetry-surface);
    border: none;
    border-radius: var(--poetry-radius);
    padding: 9px 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(124, 92, 184, 0.2);
  }
  .poetry-details-edit-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(124, 92, 184, 0.3);
  }
  .poetry-details-edit-save:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .poetry-details-edit-cancel {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.68rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--poetry-surface);
    color: var(--poetry-muted);
    border: 1px solid var(--poetry-border);
    border-radius: var(--poetry-radius);
    padding: 9px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .poetry-details-edit-cancel:hover {
    color: var(--poetry-ink);
    border-color: var(--poetry-ink);
  }

  .poetry-details-save-success {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 400;
    color: #3a7d44;
    animation: poetry-fade-in 0.25s ease;
  }

  /* Skeleton */
  .poetry-details-skeleton-title {
    height: 52px;
    width: 75%;
    background: linear-gradient(90deg, var(--poetry-border) 25%, #f0ece4 50%, var(--poetry-border) 75%);
    background-size: 200% 100%;
    animation: poetry-shimmer 1.6s infinite;
    border-radius: var(--poetry-radius);
    margin-bottom: 28px;
  }

  .poetry-details-skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, var(--poetry-border) 25%, #f0ece4 50%, var(--poetry-border) 75%);
    background-size: 200% 100%;
    animation: poetry-shimmer 1.6s infinite;
    border-radius: var(--poetry-radius);
    margin-bottom: 12px;
  }

  @keyframes poetry-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .poetry-details-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(196, 69, 105, 0.08);
    border: 1px solid rgba(196, 69, 105, 0.2);
    border-radius: var(--poetry-radius);
    padding: 10px 14px;
    font-size: 0.78rem;
    color: #c44569;
    margin-bottom: 24px;
  }

  /* Decorative element */
  .poetry-details-ornament {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 48px 0;
    color: var(--poetry-gold);
    opacity: 0.6;
  }

  .poetry-details-ornament::before,
  .poetry-details-ornament::after {
    content: '';
    width: 50px;
    height: 1px;
    background: linear-gradient(90deg, transparent, currentColor, transparent);
  }

  @media (max-width: 600px) {
    .poetry-details-wrapper {
      padding: 40px 20px 60px;
    }
    .poetry-details-title {
      font-size: 1.8rem;
    }
  }
`;

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

function Skeleton() {
  return (
    <div>
      <div className="poetry-details-skeleton-title" />
      <div className="poetry-details-skeleton-line" style={{ width: "90%" }} />
      <div className="poetry-details-skeleton-line" style={{ width: "85%" }} />
      <div className="poetry-details-skeleton-line" style={{ width: "78%" }} />
      <div className="poetry-details-skeleton-line" style={{ width: "82%" }} />
    </div>
  );
}

function PoetryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "", mood: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const poemRes = await fetchPoemById(id);
      setPoem(poemRes.data);
    } catch {
      setLoadError("Failed to load poem. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [id]);

  const currentUser = getLoggedInUser();
  const isOwner = currentUser && poem && currentUser === poem.author;

  const openEdit = () => {
    setEditForm({
      title: poem.title,
      content: poem.content,
      mood: poem.mood || "",
    });
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      setSaveError("Title and content can't be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { data } = await updatePoemById(id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        mood: editForm.mood.trim() || null,
        tags: poem.tags || [],
      });
      setPoem(data);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      const status = err?.response?.status;
      setSaveError(
        status === 403
          ? "You don't have permission to edit this poem."
          : "Failed to save changes. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="poetry-details-wrapper">
        <Link to="/home" className="poetry-details-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to poems
        </Link>

        {loadError && (
          <div className="poetry-details-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {loadError}
          </div>
        )}

        <section className="poetry-details-poem">
          {loading ? (
            <Skeleton />
          ) : editing ? (
            <div className="poetry-details-edit-form">
              <span className="poetry-details-edit-label">Mood</span>
              <input
                className="poetry-details-edit-input"
                style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.9rem", fontStyle: "normal" }}
                value={editForm.mood}
                onChange={(e) => setEditForm((f) => ({ ...f, mood: e.target.value }))}
                placeholder="e.g., Melancholy, Joy, Reflection..."
              />
              <input
                className="poetry-details-edit-input"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Poem title"
              />
              <span className="poetry-details-edit-label">Content</span>
              <TiptapEditor
                value={editForm.content}
                onChange={(content) => setEditForm((f) => ({ ...f, content }))}
                placeholder="Your poem..."
                theme="poetry"
              />
              {saveError && (
                <div className="poetry-details-error" role="alert" style={{ marginBottom: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {saveError}
                </div>
              )}
              <div className="poetry-details-edit-actions">
                <button className="poetry-details-edit-cancel" onClick={cancelEdit}>
                  Cancel
                </button>
                <button className="poetry-details-edit-save" onClick={saveEdit} disabled={saving}>
                  {saving ? (
                    <>Saving…</>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="poetry-details-post-top">
                <div className="poetry-details-meta">
                  {poem?.mood && (
                    <span className="poetry-details-mood-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {poem.mood}
                    </span>
                  )}
                  {poem?.tags?.length > 0 && (
                    <div className="poetry-details-tags">
                      {poem.tags.map((tag) => (
                        <span key={tag} className="poetry-details-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="poetry-details-byline">
                    <span className="poetry-details-byline-author">{poem?.author}</span>
                    <span className="poetry-details-byline-dot" />
                    <span>{formatDate(poem?.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {saveSuccess && (
                    <span className="poetry-details-save-success">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved
                    </span>
                  )}
                  {isOwner && (
                    <button className="poetry-details-edit-btn" onClick={openEdit}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <h1 className="poetry-details-title">{poem?.title}</h1>
              <hr className="poetry-details-divider" />
              <div
                className="poetry-details-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(poem?.content) }}
              />
            </>
          )}
        </section>

        <div className="poetry-details-ornament">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20" />
          </svg>
        </div>
      </div>
    </>
  );
}

export default PoetryDetails;
