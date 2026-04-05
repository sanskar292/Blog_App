import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchArticleById, fetchComments, createComment, getLoggedInUser } from "../../api";
import DOMPurify from "dompurify";
import CommentSection from "../../components/CommentSection";
import "./ArticleDetails.css";

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

function ArticleDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [article,   setArticle]     = useState(null);
  const [comments,  setComments]    = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError]   = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const articleRes = await fetchArticleById(id);
      setArticle(articleRes.data);
    } catch {
      setLoadError("Failed to load article. Please refresh.");
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
  const isOwner     = currentUser && article && currentUser === article.author;

  const openEdit = () => {
    navigate(`/article/edit/${id}`);
  };

  return (
    <>

      <div className="pd-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
        </div>

        <Link to="/home" className="pd-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          All stories
        </Link>

        {loadError && (
          <div className="pd-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {loadError}
          </div>
        )}

        <section className="pd-article">
          {loading ? <Skeleton /> : (
            <>
              {/* Cover image */}
              {article?.coverImage && (
                <img src={article.coverImage} alt={article.title} className="pd-cover" />
              )}

              <div className="pd-article-top">
                <div className="pd-meta">
                  {article?.tags?.length > 0 && (
                    <div className="pd-tags">
                      {article.tags.map(tag => <span key={tag} className="pd-tag">{tag}</span>)}
                    </div>
                  )}
                  <div className="pd-byline">
                    <span className="pd-byline-author">{article?.author}</span>
                    <span className="pd-byline-dot" />
                    <span>{formatDate(article?.createdAt)}</span>
                    <span className="pd-byline-dot" />
                    <span>{readTime(article?.content)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

              <h1 className="pd-title">{article?.title}</h1>
              <hr className="pd-divider" />
              <div
                className="pd-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article?.content || "") }}
              />
            </>
          )}
        </section>

        {!loading && (
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

export default ArticleDetails;
