import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPoems, getLoggedInUser } from '../../api';
import ScrollFloat from '../../components/ScrollFloat';
import './PoetryHome.css';

const PoetryHome = () => {
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

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="poetry-home">
      {/* Notebook lines background */}
      <div className="nb-lines" />
      <div className="nb-margin-line" />
      <div className="nb-spiral" />

      {/* ===== Header ===== */}
      <header className="nb-header">
        <div className="nb-header-inner">
          <Link to="/" className="nb-logo">
            <span className="nb-logo-doodle">✦</span>
            Celestial Scribe
          </Link>
          <nav className="nb-nav">
            <Link to="/poetry" className="nb-nav-link active">Discover</Link>
            {currentUser && <Link to="/poetry/create" className="nb-nav-link">Write</Link>}
            <Link to="/search" className="nb-nav-link">Search</Link>
          </nav>
          <div className="nb-header-actions">
            {currentUser ? (
              <Link to="/profile" className="nb-avatar">
                {currentUser.username?.charAt(0).toUpperCase() || '?'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="nb-link-ghost">Log in</Link>
                <Link to="/register" className="nb-link-filled">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="nb-main">
        {/* ===== Hero - Pinned Note ===== */}
        {loading ? (
          <div className="nb-hero nb-hero-loading">
            <div className="nb-note nb-note-large">
              <div className="nb-tape nb-tape-left" />
              <div className="nb-skeleton-block" />
              <div className="nb-skeleton-line" />
              <div className="nb-skeleton-line short" />
            </div>
          </div>
        ) : featuredPoem ? (
          <div className="nb-hero">
            <div className="nb-note nb-note-large">
              <div className="nb-tape nb-tape-left" />
              <div className="nb-tape nb-tape-right" />
              <span className="nb-pin" />
              <div className="nb-note-inner">
                <div className="nb-note-content">
                  <span className="nb-tag">featured</span>
                  <h1 className="nb-hero-title">{featuredPoem.title}</h1>
                  <p className="nb-hero-excerpt">
                    {stripHtml(featuredPoem.content).substring(0, 200)}...
                  </p>
                  <div className="nb-note-footer">
                    <span className="nb-note-author">— {featuredPoem.author}</span>
                    <div className="nb-note-actions">
                      <button
                        className="nb-btn nb-btn-ink"
                        onClick={() => navigate(`/poetry/${featuredPoem.id}`)}
                      >
                        Read →
                      </button>
                      <button className="nb-btn nb-btn-sketch">Save</button>
                    </div>
                  </div>
                </div>
                {featuredPoem.imageUrl && (
                  <div className="nb-note-photo">
                    <img src={featuredPoem.imageUrl} alt={featuredPoem.title} />
                    <div className="nb-photo-frame" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="nb-hero nb-hero-empty">
            <div className="nb-note nb-note-large">
              <div className="nb-tape nb-tape-left" />
              <div className="nb-note-inner">
                <span className="nb-tag">welcome</span>
                <h1 className="nb-hero-title">Celestial Scribe</h1>
                <p className="nb-hero-excerpt">
                  Where words become stars and verses light the cosmos.
                </p>
                {currentUser && (
                  <Link to="/poetry/create" className="nb-btn nb-btn-ink">
                    Write Your First Poem
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Gallery Section ===== */}
        <section className="nb-gallery">
          <div className="nb-gallery-header">
            <p className="nb-subtitle">unveiling the nocturne</p>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=30%"
              scrollEnd="bottom bottom-=30%"
              stagger={0.03}
              containerClassName="nb-scroll-title"
              textClassName="nb-scroll-text"
            >
              The Celestial Gallery
            </ScrollFloat>
            <div className="nb-doodle-divider">~ ~ ~ ~ ~</div>
          </div>

          {recentPoems.length > 0 ? (
            <>
              {/* Featured note - full width */}
              {recentPoems[0] && (
                <div className="nb-note nb-note-featured">
                  <div className="nb-tape nb-tape-center" />
                  <div className="nb-note-inner nb-note-inner-wide">
                    <div className="nb-note-content">
                      <span className="nb-tag">featured</span>
                      <h3 className="nb-card-title-lg">{recentPoems[0].title}</h3>
                      <p className="nb-card-author">by {recentPoems[0].author}</p>
                      <p className="nb-card-excerpt-lg">
                        {stripHtml(recentPoems[0].content).substring(0, 180)}...
                      </p>
                      <button
                        className="nb-btn nb-btn-ink"
                        onClick={() => navigate(`/poetry/${recentPoems[0].id}`)}
                      >
                        Read →
                      </button>
                    </div>
                    {recentPoems[0].imageUrl && (
                      <div className="nb-card-photo">
                        <img src={recentPoems[0].imageUrl} alt={recentPoems[0].title} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grid of small notes */}
              <div className="nb-notes-grid">
                {recentPoems.slice(1).map((poem, i) => (
                  <div
                    key={poem.id}
                    className="nb-note nb-note-small"
                    style={{
                      transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (0.5 + Math.random() * 1.5)}deg)`
                    }}
                    onClick={() => navigate(`/poetry/${poem.id}`)}
                  >
                    {poem.imageUrl && (
                      <div className="nb-note-small-photo">
                        <img src={poem.imageUrl} alt={poem.title} />
                      </div>
                    )}
                    <div className="nb-note-small-content">
                      <h3 className="nb-card-title">{poem.title}</h3>
                      <p className="nb-card-author">by {poem.author}</p>
                      <p className="nb-card-excerpt">
                        {stripHtml(poem.content).substring(0, 90)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="nb-note nb-note-empty">
              <div className="nb-tape nb-tape-center" />
              <div className="nb-note-inner">
                <div className="nb-empty-icon">✎</div>
                <h3 className="nb-empty-title">No poems yet</h3>
                <p className="nb-empty-text">Be the first to write something beautiful.</p>
                {currentUser && (
                  <Link to="/poetry/create" className="nb-btn nb-btn-ink">
                    Write Your First Poem
                  </Link>
                )}
              </div>
            </div>
          )}

          {recentPoems.length > 0 && (
            <div className="nb-gallery-footer">
              <button className="nb-btn nb-btn-dots" onClick={() => navigate('/poetry')}>
                · · · more poems · · ·
              </button>
            </div>
          )}
        </section>

        {/* ===== CTA Section ===== */}
        {!currentUser && (
          <section className="nb-cta">
            <div className="nb-note nb-note-cta">
              <div className="nb-tape nb-tape-center" />
              <div className="nb-note-inner">
                <ScrollFloat
                  animationDuration={1.2}
                  ease="back.inOut(2)"
                  scrollStart="center bottom+=20%"
                  scrollEnd="bottom bottom-=20%"
                  stagger={0.025}
                  containerClassName="nb-scroll-title nb-scroll-cta"
                  textClassName="nb-scroll-text"
                >
                  Your celestial journey awaits the ink
                </ScrollFloat>
                <p className="nb-cta-text">
                  Join the circle of scribes and let your verses find their place among the stars.
                </p>
                <Link to="/register" className="nb-btn nb-btn-ink nb-btn-lg">
                  ✦ Begin Writing
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="nb-footer">
        <div className="nb-footer-doodle">~ ~ ~</div>
        <div className="nb-footer-inner">
          <span className="nb-footer-brand">
            <span className="nb-logo-doodle">✦</span> Celestial Scribe
          </span>
          <div className="nb-footer-links">
            <a href="#">Manifesto</a>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
          <span className="nb-footer-copy">© 2024 Celestial Scribe</span>
        </div>
      </footer>
    </div>
  );
};

export default PoetryHome;
