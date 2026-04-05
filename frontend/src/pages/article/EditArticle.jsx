import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchArticleById, updateArticleById, getLoggedInUser } from "../../api";
import TiptapEditor from "../../components/TiptapEditor";
import "./CreateArticle.css";

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data } = await fetchArticleById(id);
        const currentUser = getLoggedInUser();
        
        if (data.author !== currentUser) {
          navigate(`/article/${id}`);
          return;
        }

        setTitle(data.title);
        setContent(data.content);
        setCoverImage(data.coverImage || "");
        setTags(data.tags || []);
      } catch (err) {
        setError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id, navigate]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSubmitting(true);
    setError(null);

    try {
      await updateArticleById(id, {
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        tags: tags,
      });
      navigate(`/article/${id}`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("You don't have permission to edit this article.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-focused-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading article...</p>
      </div>
    );
  }

  return (
    <div className="create-focused-wrapper">
      {/* Invisible Hover Trigger for Navbar */}
      <div 
        className="nav-trigger-zone" 
        onMouseEnter={() => setShowNav(true)}
      />

      {/* Top Navigation Bar - Floating & Fading */}
      <nav className={`create-nav-focused ${showNav ? "visible" : "hidden"}`} onMouseLeave={() => setShowNav(false)}>
        <div className="create-nav-inner">
          <div className="create-nav-left">
            <span className="create-nav-logo" onClick={() => navigate("/home")}>Versa</span>
            <span className="create-nav-status">Editing your story</span>
          </div>
          <div className="create-nav-right">
            <button className="create-nav-back" onClick={() => navigate(-1)}>Cancel</button>
            <button
              type="submit"
              form="edit-form"
              className="create-publish-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </nav>

      {/* Trigger Arrow Indicator when Nav is hidden */}
      {!showNav && (
        <div className="nav-indicator-arrow" onMouseEnter={() => setShowNav(true)}>
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="create-main-focused">
        <div className="create-editor-container">
          {/* Header Image Section */}
          <div className="create-header-minimal">
            {coverImage ? (
              <div className="create-header-preview">
                <img src={coverImage} alt="Header" />
                <button className="remove-header-btn" onClick={() => setCoverImage("")}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className="add-header-prompt">
                <span className="material-symbols-outlined">image</span>
                <input
                  type="text"
                  placeholder="Paste a cover image URL..."
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="create-error-minimal">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form id="edit-form" onSubmit={handleSubmit}>
            <textarea
              className="create-title-textarea"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              rows={1}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              autoFocus
            />

            <div className="create-editor-wrapper">
              <TiptapEditor
                value={content}
                onChange={setContent}
                placeholder="Tell your story..."
                theme="article"
              />
            </div>
          </form>

          {/* Footer Info */}
          <footer className="create-footer-minimal">
            <span>{wordCount} words</span>
            <span className="footer-dot">·</span>
            <span>{Math.max(1, Math.round(wordCount / 200))} min read</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default EditArticle;
