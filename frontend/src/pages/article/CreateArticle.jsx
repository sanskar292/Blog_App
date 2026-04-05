import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createNewArticle, getLoggedInUser } from "../../api";
import TiptapEditor from "../../components/TiptapEditor";
import "./CreateArticle.css";

function CreateArticle() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showNav, setShowNav] = useState(false);
  
  const currentUser = getLoggedInUser();
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Auto-hide navbar after a delay if not hovering
  useEffect(() => {
    let timeout;
    if (showNav) {
      timeout = setTimeout(() => {
        // Only hide if we aren't near the top? 
        // Actually simpler: user triggers show, and it stays until they move away or we can just leave it to hover
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showNav]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSubmitting(true);
    setError(null);

    try {
      await createNewArticle({
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
      });
      navigate("/home");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("You need to be logged in to publish.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
            <span className="create-nav-status">Draft in {currentUser}</span>
          </div>
          <div className="create-nav-right">
             <button className="create-nav-back" onClick={() => navigate(-1)}>Cancel</button>
            <button
              type="submit"
              form="create-form"
              className="create-publish-btn"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish"}
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
          <form id="create-form" onSubmit={handleSubmit}>
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

export default CreateArticle;
