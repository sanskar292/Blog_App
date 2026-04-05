import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchArticles } from "../../api";
import "./Articles.css";


const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.textContent || tmp.innerText || "";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 6;

  const loadArticles = useCallback(async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await fetchArticles(pageNum, PAGE_SIZE);
      if (pageNum === 0) {
        setArticles(data.content || []);
      } else {
        setArticles(prev => [...prev, ...(data.content || [])]);
      }
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles(0);
  }, [loadArticles]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadArticles(page + 1);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="articles-wrapper">
        <header className="articles-header">
          <span className="articles-label">Editorial Feed</span>
          <h1 className="articles-title">Articles & Long Form</h1>
        </header>

        <div className="articles-grid">
          {articles.map((article) => (
            <Link key={article.id || article._id} to={`/article/${article.id || article._id}`} className="article-card">
              <div className="article-image-wrapper">
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--surface-container)" }} />
                )}
              </div>
              <div className="article-meta">
                {article.tags?.[0] && <span className="article-tag">{article.tags[0]}</span>}
                <span className="article-date">{formatDate(article.createdAt)}</span>
              </div>
              <h2 className="article-card-title">{article.title}</h2>
              <p className="article-card-excerpt">{stripHtml(article.content)}</p>
              <div className="article-card-footer">
                <p className="article-card-author">By {article.author}</p>
                <span className="material-symbols-outlined article-card-arrow">arrow_outward</span>
              </div>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="loading-container">
            <p>Loading stories...</p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={handleLoadMore}>
              Load More Editions
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Articles;
