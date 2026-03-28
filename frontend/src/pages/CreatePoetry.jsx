import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewPoem } from "../api";
import TiptapEditor from "../components/TiptapEditor";
import "./CreatePoetry.css";

const MAX_TAGS = 5;

function CreatePoetry() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  const lineCount = content.trim() ? stripHtml(content).split("\n").filter(line => line.trim()).length : 0;

  // Add tag on Enter or comma
  const handleTagKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (newTag && !tags.includes(newTag) && tags.length < MAX_TAGS) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createNewPoem({
        title: title.trim(),
        content: content.trim(),
        mood: mood.trim() || null,
        tags,
      });
      navigate("/poetry");
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
    
      <div className="create-poetry-wrapper">
        <div className="create-poetry-header">
          <p className="create-poetry-label">New poem</p>
          <h1 className="create-poetry-title">
            Compose your <span>verse</span>
          </h1>
        </div>

        {error && (
          <div className="create-poetry-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form className="create-poetry-form" onSubmit={handleSubmit}>
          {/* Mood */}
          <div className="create-poetry-field">
            <label className="create-poetry-field-label">Mood (optional)</label>
            <input
              className="create-poetry-input create-poetry-mood-input"
              placeholder="e.g., Melancholy, Joy, Reflection, Longing..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Title */}
          <div className="create-poetry-field">
            <label className="create-poetry-field-label">Title</label>
            <input
              className="create-poetry-title-input"
              placeholder="Your poem's title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="create-poetry-field">
            <label className="create-poetry-field-label">Content</label>
            <TiptapEditor
              value={content}
              onChange={setContent}
              placeholder="Let your words flow..."
              theme="poetry"
            />
            <div className="create-poetry-line-count">
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </div>
          </div>

          {/* Tags */}
          <div className="create-poetry-field">
            <label className="create-poetry-field-label">Tags</label>
            <div className="poetry-tags-wrapper">
              {tags.map((tag) => (
                <span key={tag} className="poetry-tag-chip">
                  {tag}
                  <button
                    type="button"
                    className="poetry-tag-remove"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length < MAX_TAGS && (
                <input
                  className="poetry-tag-input"
                  placeholder={tags.length === 0 ? "Add tags..." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                />
              )}
            </div>
            <span className="poetry-tags-hint">
              Press Enter or comma to add — max {MAX_TAGS} tags
            </span>
          </div>

          <div className="create-poetry-footer">
            <span className="create-poetry-hint">
              {lineCount > 0
                ? `${lineCount} ${lineCount === 1 ? "line" : "lines"} of poetry`
                : "Start composing"}
            </span>
            <button
              type="submit"
              className="create-poetry-submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="create-poetry-spinner" /> Publishing...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                  Publish
                </>
              )}
            </button>
          </div>
        </form>

        <div className="create-poetry-ornament">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20" />
          </svg>
        </div>
      </div>
    </>
  );
}

export default CreatePoetry;
