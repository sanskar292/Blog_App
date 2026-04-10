import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPoems, getLoggedInUser } from '../../api';
import './PoetryHome.css';

const PoetryHome = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [featuredPoem, setFeaturedPoem] = useState(null);
  const [recentPoems, setRecentPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = getLoggedInUser();

  useEffect(() => {
    const loadPoems = async () => {
      try {
        const { data } = await fetchPoems(0, 13);
        const poems = data.content || [];

        // First poem becomes featured, next 12 for 3x4 grid
        if (poems.length > 0) {
          setFeaturedPoem(poems[0]);
          setRecentPoems(poems.slice(1, 13));
        }
      } catch (err) {
        console.error('Failed to load poems:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPoems();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const minutes = Math.floor((now - date) / 60000);
    
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className={`${darkMode ? 'dark' : 'light'} poetry-app`}>
      {/* Top Navigation */}
      <header className="top-nav">
        <nav className="nav-container">
          <div className="logo">Celestial Scribe</div>
          <div className="nav-links">
            <Link to="/poetry" className="nav-link active">Discover</Link>
            {currentUser && (
              <Link to="/poetry/create" className="nav-link">Write</Link>
            )}
          </div>
          <div className="nav-actions">
            <Link to="/search" className="material-symbols-outlined icon">search</Link>
            <button
              className="material-symbols-outlined icon dark-toggle"
              onClick={toggleDarkMode}
            >
              {darkMode ? 'light_mode' : 'dark_mode'}
            </button>
          </div>
        </nav>
      </header>

      <main className="main-content">
        {loading ? (
          <section className="hero-section">
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-badge">Loading...</div>
            </div>
          </section>
        ) : featuredPoem ? (
          /* Hero: Featured Poem */
          <section className="hero-section">
            {featuredPoem.imageUrl && (
              <div className="hero-thumbnail-container">
                <img
                  src={featuredPoem.imageUrl}
                  alt={featuredPoem.title}
                  className="hero-thumbnail"
                />
                <div className="hero-vignette-left"></div>
                <div className="hero-vignette-right"></div>
              </div>
            )}
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-badge">Featured Poem</div>
              <h1 className="hero-title">{featuredPoem.title}</h1>
              <p className="hero-quote">
                "{stripHtml(featuredPoem.content).substring(0, 100)}..."
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/poetry/${featuredPoem.id}`)}
                >
                  Read More
                </button>
                <button className="btn btn-secondary">Save to Library</button>
              </div>
            </div>
          </section>
        ) : (
          /* Hero: No poems available */
          <section className="hero-section">
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-badge">Welcome</div>
              <h1 className="hero-title">Celestial Scribe</h1>
              <p className="hero-quote">
                "Where words become stars and verses light the cosmos."
              </p>
              <div className="hero-actions">
                {currentUser && (
                  <Link to="/poetry/create" className="btn btn-primary">
                    Write Your First Poem
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Discovery Masonry Grid */}
        <section className="gallery-section">
          <div className="gallery-header">
            <div>
              <span className="gallery-subtitle">Unveiling the Nocturne</span>
              <h2 className="gallery-title">The Celestial Gallery</h2>
            </div>
            <div className="gallery-filters">
              <button className="filter-btn active">Featured</button>
            </div>
          </div>

          {recentPoems.length > 0 ? (
            <div className="masonry-grid">
              {recentPoems.map((poem) => (
                <article
                  key={poem.id}
                  className="poem-card"
                  onClick={() => navigate(`/poetry/${poem.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {poem.imageUrl ? (
                    <div className="poem-card-thumbnail">
                      <img src={poem.imageUrl} alt={poem.title} loading="lazy" />
                      <div className="poem-card-overlay">
                        <div className="poem-card-hover-content">
                          <h3 className="poem-card-title-overlay">{poem.title}</h3>
                          <p className="poem-card-author-overlay">by {poem.author}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="poem-card-content">
                      <h3 className="poem-card-title">{poem.title}</h3>
                      <p className="poem-card-author">by {poem.author}</p>
                      <p className="poem-card-excerpt">{stripHtml(poem.content).substring(0, 100)}...</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <p>No poems have been published yet.</p>
              {currentUser && (
                <Link to="/poetry/create" className="btn btn-primary">
                  Create the First Poem
                </Link>
              )}
            </div>
          )}

          {/* More Content Loader */}
          <div className="load-more-section">
            <div className="load-more-divider"></div>
            <button className="load-more-btn" onClick={() => navigate('/poetry')}>
              Load More Poems
            </button>
          </div>
        </section>

        {/* CTA Section */}
        {!currentUser && (
          <section className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">Your celestial journey awaits the ink.</h2>
              <p className="cta-description">
                Join the circle of scribes and let your verses find their place among the stars.
              </p>
              <Link to="/register" className="btn btn-cta">
                Begin Writing
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-text">© 2024 Celestial Scribe. All rights reserved.</div>
        <div className="footer-links">
          <a href="#">Manifesto</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
        <div className="footer-icons">
          <span className="material-symbols-outlined icon">auto_awesome</span>
          <span className="material-symbols-outlined icon">history_edu</span>
        </div>
      </footer>
    </div>
  );
};

export default PoetryHome;
