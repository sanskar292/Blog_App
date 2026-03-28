import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewPost } from "../api";
import TiptapEditor from "../components/TiptapEditor";
import "./CreatePost.css";

const MAX_TAGS = 5;

function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Add tag on Enter or comma
  const handleTagKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (newTag && !tags.includes(newTag) && tags.length < MAX_TAGS) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSubmitting(true);
    setError(null);

    try {
      await createNewPost({
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        tags,
      });
      navigate("/");
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
    <>
      <div className="create-wrapper">
        <div className="create-header">
          <p className="create-label">New story</p>
          <h1 className="create-title">Write something <em>worth reading.</em></h1>
        </div>

        {/* Cover preview */}
        {coverImage ? (
          <img src={coverImage} alt="Cover preview" className="cover-preview"
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div className="cover-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Cover image preview</span>
          </div>
        )}

        {error && (
          <div className="create-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form className="create-form" onSubmit={handleSubmit}>

          {/* Cover image URL */}
          <div className="create-field">
            <label className="create-field-label">Cover image URL</label>
            <input
              className="create-input"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Title */}
          <div className="create-field">
            <label className="create-field-label">Title</label>
            <input
              className="create-title-input"
              placeholder="Your story begins here…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="create-field">
            <label className="create-field-label">Content</label>
            <TiptapEditor
              value={content}
              onChange={setContent}
              placeholder="Write your story…"
            />
          </div>

          <div className="create-word-count">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>

          {/* Tags */}
          <div className="create-field">
            <label className="create-field-label">Tags</label>
            <div className="tags-wrapper">
              {tags.map(tag => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              {tags.length < MAX_TAGS && (
                <input
                  className="tag-input"
                  placeholder={tags.length === 0 ? "Add tags…" : ""}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                />
              )}
            </div>
            <span className="tags-hint">Press Enter or comma to add — max {MAX_TAGS} tags</span>
          </div>

          <div className="create-footer">
            <span className="create-hint">
              {wordCount > 0
                ? `~${Math.max(1, Math.round(wordCount / 200))} min read`
                : "Start writing to see read time"}
            </span>
            <button
              type="submit"
              className="create-submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <><span className="create-spinner" /> Publishing…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Publish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreatePost;