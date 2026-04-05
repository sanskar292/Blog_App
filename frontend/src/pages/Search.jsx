import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { searchArticles } from "../api";

const styles = `
  .search-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }

  .search-header {
    margin-bottom: 3rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--outline-variant);
  }

  .search-title {
    font-family: 'Noto Serif', serif;
    font-size: 2rem;
    color: var(--primary);
  }

  .search-query {
    color: var(--secondary);
    font-style: italic;
  }

  .search-results {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .search-result-card {
    display: flex;
    gap: 1.5rem;
    text-decoration: none;
    color: inherit;
  }

  .search-result-image {
    width: 200px;
    height: 125px;
    border-radius: 0.5rem;
    object-fit: cover;
    background: var(--surface-container);
  }

  .search-result-content {
    flex: 1;
  }

  .search-result-tag {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--secondary);
    font-weight: 700;
    margin-bottom: 0.5rem;
    display: block;
  }

  .search-result-title {
    font-family: 'Noto Serif', serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  .search-result-excerpt {
    font-size: 0.875rem;
    color: var(--on-surface-variant);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .no-results {
    padding: 5rem 0;
    text-align: center;
    color: var(--on-surface-variant);
  }

  @media (max-width: 640px) {
    .search-result-card {
      flex-direction: column;
    }
    .search-result-image {
      width: 100%;
      height: 200px;
    }
  }
`;

function Search() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(location.search).get("q");

  const performSearch = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await searchArticles(query, 0, 20);
      setResults(data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="search-page">
        <header className="search-header">
          <h1 className="search-title">
            Search Results for <span className="search-query">"{query}"</span>
          </h1>
        </header>

        {loading ? (
          <p>Searching archives...</p>
        ) : results.length > 0 ? (
          <div className="search-results">
            {results.map((article) => (
              <Link key={article.id || article._id} to={`/article/${article.id || article._id}`} className="search-result-card">
                {article.coverImage && (
                  <img src={article.coverImage} alt={article.title} className="search-result-image" />
                )}
                <div className="search-result-content">
                  <span className="search-result-tag">{article.tags?.[0] || "Article"}</span>
                  <h2 className="search-result-title">{article.title}</h2>
                  <p className="search-result-excerpt">{stripHtml(article.content)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', opacity: 0.2 }}>search_off</span>
            <p style={{ marginTop: '1rem' }}>No matches found in our archives.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Search;
