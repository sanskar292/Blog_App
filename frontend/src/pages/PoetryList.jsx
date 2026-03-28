import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchPoems, deletePoemById, getLoggedInUser } from "../api";
import PoetryCard from "../components/PoetryCard";

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
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--poetry-paper);
    color: var(--poetry-ink);
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
    min-height: 100vh;
  }

  .poetry-wrapper {
    max-width: 760px;
    margin: 0 auto;
    padding: 56px 24px 80px;
  }

  /* ── Header ── */
  .poetry-header {
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--poetry-border);
    text-align: center;
    position: relative;
  }

  .poetry-header::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--poetry-gold), transparent);
  }

  .poetry-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--poetry-ink);
    margin-bottom: 12px;
  }

  .poetry-title span {
    color: var(--poetry-accent);
  }

  .poetry-subtitle {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.85rem;
    font-weight: 200;
    color: var(--poetry-muted);
    max-width: 420px;
    line-height: 1.8;
    margin: 0 auto;
    letter-spacing: 0.05em;
  }

  .poetry-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 20px;
  }

  .poetry-count {
    font-size: 0.68rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--poetry-muted);
    background: rgba(139, 134, 153, 0.1);
    padding: 5px 14px;
    border-radius: 20px;
  }

  .poetry-write-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--poetry-surface);
    background: linear-gradient(135deg, var(--poetry-accent), #5c4a8a);
    text-decoration: none;
    padding: 9px 20px;
    border-radius: 20px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(124, 92, 184, 0.2);
  }

  .poetry-write-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 92, 184, 0.3);
  }

  /* ── Error ── */
  .poetry-error {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(196, 69, 105, 0.08);
    border: 1px solid rgba(196, 69, 105, 0.2);
    border-radius: var(--poetry-radius);
    padding: 12px 16px;
    margin-bottom: 24px;
    font-size: 0.8rem;
    color: #c44569;
  }

  .poetry-error-dismiss {
    margin-left: auto;
    cursor: pointer;
    background: none;
    border: none;
    color: #c44569;
    font-size: 1.1rem;
    opacity: 0.7;
    transition: opacity 0.15s;
    padding: 0;
    line-height: 1;
  }

  .poetry-error-dismiss:hover { opacity: 1; }

  /* ── Skeleton ── */
  .poetry-skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .poetry-skeleton-item {
    background: var(--poetry-surface);
    border: 1px solid var(--poetry-border);
    border-radius: var(--poetry-radius);
    padding: 32px 28px;
  }

  .poetry-skeleton-line {
    height: 10px;
    background: linear-gradient(90deg, var(--poetry-border) 25%, #f0ece4 50%, var(--poetry-border) 75%);
    background-size: 200% 100%;
    animation: poetry-shimmer 1.6s infinite;
    border-radius: 2px;
  }

  @keyframes poetry-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Poetry list ── */
  .poetry-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* ── Empty ── */
  .poetry-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 24px;
    gap: 20px;
    color: var(--poetry-muted);
    background: var(--poetry-surface);
    border: 1px dashed var(--poetry-border);
    border-radius: var(--poetry-radius);
  }

  .poetry-empty-state svg {
    opacity: 0.35;
  }

  .poetry-empty-state p {
    font-size: 0.9rem;
    font-weight: 200;
    letter-spacing: 0.03em;
  }

  .poetry-empty-state-link {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--poetry-surface);
    background: linear-gradient(135deg, var(--poetry-accent), #5c4a8a);
    text-decoration: none;
    padding: 10px 24px;
    border-radius: 20px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(124, 92, 184, 0.2);
  }

  .poetry-empty-state-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 92, 184, 0.3);
  }

  /* ── Pagination ── */
  .poetry-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 48px;
    padding-top: 28px;
    border-top: 1px solid var(--poetry-border);
  }

  .poetry-page-btn {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    font-weight: 400;
    background: var(--poetry-surface);
    border: 1px solid var(--poetry-border);
    border-radius: var(--poetry-radius);
    padding: 8px 14px;
    color: var(--poetry-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 38px;
  }

  .poetry-page-btn:hover:not(:disabled) {
    color: var(--poetry-accent);
    border-color: var(--poetry-accent);
    transform: translateY(-1px);
  }

  .poetry-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .poetry-page-btn.active {
    background: linear-gradient(135deg, var(--poetry-accent), #5c4a8a);
    color: var(--poetry-surface);
    border-color: var(--poetry-accent);
  }

  .poetry-page-info {
    font-size: 0.7rem;
    color: var(--poetry-muted);
    padding: 0 8px;
    letter-spacing: 0.05em;
  }

  /* ── Decorative ── */
  .poetry-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 40px 0;
    color: var(--poetry-muted);
    opacity: 0.5;
  }

  .poetry-divider::before,
  .poetry-divider::after {
    content: '';
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, currentColor, transparent);
  }

  @media (max-width: 600px) {
    .poetry-wrapper {
      padding: 40px 20px 60px;
    }
    .poetry-header {
      margin-bottom: 36px;
    }
  }
`;

function PoetryList() {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const PAGE_SIZE = 6;

  const loadPoems = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await fetchPoems(page, PAGE_SIZE);
      setPoems(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch {
      setError("Failed to load poems. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoems(0);
  }, [loadPoems]);

  const goToPage = (page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadPoems(page);
  };

  const deletePoem = useCallback(async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    setError(null);
    try {
      await deletePoemById(id);
      setPoems((prev) => prev.filter((p) => p.id !== id));
      setTotalElements((prev) => prev - 1);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Not authorised to delete this poem.");
      } else if (status === 404) {
        setPoems((prev) => prev.filter((p) => p.id !== id));
      } else {
        setError("Couldn't delete that poem. Try again.");
      }
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  const pageButtons = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const currentUser = getLoggedInUser();

  return (
    <>
      <style>{styles}</style>

      <div className="poetry-wrapper">
        <header className="poetry-header">
          <h1 className="poetry-title">
            Verses & <span>Verses</span>
          </h1>
          <p className="poetry-subtitle">
            Where words dance and emotions bloom — a collection of poetic expressions
          </p>
          <div className="poetry-meta">
            {!loading && (
              <span className="poetry-count">
                {totalElements} {totalElements === 1 ? "poem" : "poems"}
              </span>
            )}
            {currentUser && (
              <Link to="/poetry/create" className="poetry-write-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Write Poem
              </Link>
            )}
          </div>
        </header>

        {error && (
          <div className="poetry-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button className="poetry-error-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading ? (
          <div className="poetry-skeleton-list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="poetry-skeleton-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="poetry-skeleton-line" style={{ width: "15%", height: "8px" }} />
                <div className="poetry-skeleton-line" style={{ width: "60%", height: "18px", marginTop: "14px" }} />
                <div className="poetry-skeleton-line" style={{ width: "85%", marginTop: "12px" }} />
                <div className="poetry-skeleton-line" style={{ width: "75%", marginTop: "12px" }} />
                <div className="poetry-skeleton-line" style={{ width: "40%", marginTop: "16px" }} />
              </div>
            ))}
          </div>
        ) : poems.length === 0 ? (
          <div className="poetry-empty-state">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            <p>No poems yet — be the first to compose one.</p>
            {currentUser && (
              <Link to="/poetry/create" className="poetry-empty-state-link">
                Write a poem
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="poetry-list">
              {poems.map((poem) => (
                <PoetryCard
                  key={poem.id}
                  poem={poem}
                  onDelete={deletePoem}
                  deletingId={deletingId}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="poetry-pagination" aria-label="Poetry pages">
                <button
                  className="poetry-page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  ←
                </button>
                {pageButtons().map((p) => (
                  <button
                    key={p}
                    className={`poetry-page-btn${p === currentPage ? " active" : ""}`}
                    onClick={() => goToPage(p)}
                  >
                    {p + 1}
                  </button>
                ))}
                <button
                  className="poetry-page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  →
                </button>
                <span className="poetry-page-info">{currentPage + 1} / {totalPages}</span>
              </nav>
            )}
          </>
        )}

        <div className="poetry-divider">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20" />
          </svg>
        </div>
      </div>
    </>
  );
}

export default PoetryList;
