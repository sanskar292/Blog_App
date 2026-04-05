import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchPoems, deletePoemById, getLoggedInUser } from "../../api";
import PoetryCard from "../../components/PoetryCard";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@200;300;400&display=swap');

  :root {
    --p-bg: #fffbf5;
    --p-text: #2d2d2d;
    --p-muted: #666;
    --p-card-bg: #ffffff;
    --p-accent: #ff6b6b;
    --p-reel-bg: rgba(0,0,0,0.03);
    --p-shadow: 0 10px 40px rgba(0,0,0,0.05);

    --font-poetic: 'Cormorant Garamond', serif;
    --font-ui: 'Outfit', sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --p-bg: #0d0d0d;
      --p-text: #e0e0e0;
      --p-muted: #888;
      --p-card-bg: #1a1a1a;
      --p-accent: #ffa0a0;
      --p-reel-bg: rgba(255,255,255,0.02);
      --p-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }
  }

  .poetic-universe {
    background: var(--p-bg);
    color: var(--p-text);
    min-height: 100vh;
    font-family: var(--font-ui);
    padding-bottom: 5rem;
    transition: background 0.5s ease;
  }

  .poetic-hero {
    text-align: center;
    padding: 6rem 2rem 4rem;
    position: relative;
    overflow: hidden;
  }

  .poetic-hero-bg {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,107,107,0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(107,107,255,0.05) 0%, transparent 40%);
    animation: slowSpin 60s linear infinite;
    z-index: 0;
  }

  @keyframes slowSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .poetic-title {
    font-family: var(--font-poetic);
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 300;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    letter-spacing: -0.01em;
  }

  .poetic-subtitle {
    font-size: 1rem;
    color: var(--p-muted);
    letter-spacing: 0.1em;
    font-weight: 300;
    max-width: 600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .poetic-reels-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .poetic-reel-row {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .poetic-reel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid rgba(128,128,128,0.1);
    padding-bottom: 0.75rem;
  }

  .poetic-reel-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--p-muted);
    font-weight: 400;
  }

  .poetic-reel-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 20px;
    perspective: 1000px;
  }

  /* Reel tilt effect from ends */
  .poetic-reel-grid > *:nth-child(1) { transform: rotateY(15deg) rotateX(2deg); }
  .poetic-reel-grid > *:nth-child(2) { transform: rotateY(10deg) rotateX(1deg); }
  .poetic-reel-grid > *:nth-child(3) { transform: rotateY(5deg); }
  .poetic-reel-grid > *:nth-child(5) { transform: rotateY(-5deg); }
  .poetic-reel-grid > *:nth-child(6) { transform: rotateY(-10deg) rotateX(1deg); }
  .poetic-reel-grid > *:nth-child(7) { transform: rotateY(-15deg) rotateX(2deg); }

  @media (max-width: 1200px) {
    .poetic-reel-grid { grid-template-columns: repeat(4, 1fr); }
    .poetic-reel-grid > * { transform: none !important; }
  }

  @media (max-width: 768px) {
    .poetic-reel-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .poetic-loading {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 20px;
    margin-top: 2rem;
  }

  .skeleton-card {
    height: 180px;
    background: var(--p-card-bg);
    border-radius: 12px;
    opacity: 0.5;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { opacity: 0.3; transform: scale(0.98); }
    50% { opacity: 0.6; transform: scale(1); }
    100% { opacity: 0.3; transform: scale(0.98); }
  }

  .poetic-empty {
    text-align: center;
    padding: 6rem;
    font-family: var(--font-poetic);
    font-style: italic;
    font-size: 1.5rem;
    color: var(--p-muted);
  }

  .poetic-create-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--p-accent);
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(255,107,107,0.3);
    text-decoration: none;
    z-index: 100;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .poetic-create-btn:hover {
    transform: scale(1.1) rotate(90deg);
  }
`;

function PoetryList() {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const PAGE_SIZE = 35; // 5 reels * 7 cards

  const loadPoems = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const { data } = await fetchPoems(page, PAGE_SIZE);
      setPoems(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(data.number);
    } catch {
      setError("Failed to fetch. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoems(0);
  }, [loadPoems]);

  const deletePoem = useCallback(async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deletePoemById(id);
      setPoems(prev => prev.filter(p => p.id !== id));
    } catch {
      setError("Could not delete. Check permissions.");
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  const reels = [];
  for (let i = 0; i < 5; i++) {
    const reelData = poems.slice(i * 7, (i + 1) * 7);
    if (reelData.length > 0 || loading) {
       reels.push({ id: i, data: reelData });
    }
  }

  const currentUser = getLoggedInUser();

  return (
    <div className="poetic-universe">
      <style>{styles}</style>
      
      <header className="poetic-hero">
        <div className="poetic-hero-bg" />
        <h1 className="poetic-title">The Poetry Gallery</h1>
        <p className="poetic-subtitle">Browse through curved rows of inspiration and rhythm.</p>
      </header>

      {error ? (
        <div className="poetic-empty">{error}</div>
      ) : loading ? (
        <div className="poetic-reels-container">
           <div className="poetic-loading">
             {[...Array(PAGE_SIZE)].map((_, i) => <div key={i} className="skeleton-card" />)}
           </div>
        </div>
      ) : poems.length === 0 ? (
        <div className="poetic-empty">The gallery is currently empty. Start the movement.</div>
      ) : (
        <div className="poetic-reels-container">
          {reels.map((reel, rIdx) => (
            <div key={reel.id} className="poetic-reel-row">
              <div className="poetic-reel-header">
                 <span className="poetic-reel-title">Reel #{rIdx + 1}</span>
              </div>
              <div className="poetic-reel-grid">
                {reel.data.map(poem => (
                  <PoetryCard 
                    key={poem.id} 
                    poem={poem} 
                    onDelete={deletePoem} 
                    deletingId={deletingId}
                  />
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <button 
                onClick={() => loadPoems(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="poetic-reel-title"
                style={{ background: 'none', border: '1px solid currentColor', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
              >
                {currentPage >= totalPages - 1 ? 'End of Gallery' : 'Next Gallery Floor'}
              </button>
            </div>
          )}
        </div>
      )}

      {currentUser && (
        <Link to="/poetry/create" className="poetic-create-btn" title="Create Poem">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Link>
      )}
    </div>
  );
}

export default PoetryList;

