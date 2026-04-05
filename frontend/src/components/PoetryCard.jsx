import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../api";
import DOMPurify from "dompurify";
import "./PoetryCard.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function PoetryCard({ poem, onDelete, deletingId }) {
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();
  const currentUser = getLoggedInUser();
  const isOwner = currentUser && currentUser === poem.author;
  const isDeleting = deletingId === poem.id;

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/poetry/edit/${poem.id}`);
  };

  return (
    <Link to={`/poetry/${poem.id}`} className={`poetry-card${isDeleting ? " deleting" : ""}`}>
      {poem.imageUrl ? (
        <div className="poetry-card-thumb">
          <img src={poem.imageUrl} alt={poem.title} />
          <div className="poetry-card-overlay">
            <h2 className="poetry-card-title">{poem.title}</h2>
          </div>
        </div>
      ) : (
        <div className="poetry-card-title-container">
          <h2 className="poetry-card-title">{poem.title}</h2>
          {poem.author && <span className="poetry-card-author">by {poem.author}</span>}
        </div>
      )}

      <div className="poetry-card-footer">
        <div className="poetry-card-meta">
          <span className="poetry-card-mood">{poem.mood || "Reflection"}</span>
        </div>
      </div>

      {isOwner && (
        <div className="poetry-card-actions" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          {!confirming ? (
            <>
              <button 
                className="poetry-action-btn" 
                onClick={handleEdit}
                title="Edit"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button 
                className="poetry-action-btn delete" 
                onClick={() => setConfirming(true)}
                title="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </>
          ) : (
            <div className="poetry-card-confirm">
              <button
                className="poetry-confirm-yes"
                onClick={() => {
                  setConfirming(false);
                  onDelete(poem.id);
                }}
              >
                ✓
              </button>
              <button className="poetry-confirm-no" onClick={() => setConfirming(false)}>
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

export default PoetryCard;
