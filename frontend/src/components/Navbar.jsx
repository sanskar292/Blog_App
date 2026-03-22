import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --surface: #fffdf8;
    --border: #e2ded4;
    --radius: 4px;
  }

  /* ── Bar ── */
  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--surface);
    border-bottom: 1.5px solid var(--ink);
    font-family: 'DM Sans', sans-serif;
  }

  .nav-inner {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ── Wordmark ── */
  .nav-wordmark {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: var(--ink);
    text-decoration: none;
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .nav-wordmark em {
    font-style: italic;
    color: var(--accent);
  }

  /* ── Desktop actions ── */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Ghost link */
  .nav-link {
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: var(--radius);
    transition: color 0.15s, background 0.15s;
  }

  .nav-link:hover { color: var(--ink); background: var(--border); }
  .nav-link.active { color: var(--ink); }

  /* Filled CTA */
  .nav-cta {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    text-decoration: none;
    padding: 7px 16px;
    border-radius: var(--radius);
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    display: inline-flex;
    align-items: center;
  }

  .nav-cta:hover { background: #2e2e2b; }

  /* Logout — same shape, muted danger tint */
  .nav-logout {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: none;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }

  .nav-logout:hover {
    color: var(--accent);
    border-color: #f5c6ba;
    background: #fef2ef;
  }

  /* Separator dot */
  .nav-sep {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--border);
    margin: 0 2px;
  }

  /* ── Mobile hamburger ── */
  .nav-hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    color: var(--ink);
    border-radius: var(--radius);
    transition: background 0.15s;
  }

  .nav-hamburger:hover { background: var(--border); }

  /* ── Mobile drawer ── */
  .nav-drawer {
    border-top: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease, padding 0.3s ease;
  }

  .nav-drawer.open {
    max-height: 220px;
  }

  .nav-drawer-inner {
    padding: 16px 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 860px;
    margin: 0 auto;
  }

  .nav-drawer-link {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--ink);
    text-decoration: none;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: color 0.15s;
  }

  .nav-drawer-link:last-child { border-bottom: none; }
  .nav-drawer-link:hover { color: var(--accent); }

  .nav-drawer-logout {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--accent);
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    padding: 8px 0;
    cursor: pointer;
    text-align: left;
    transition: opacity 0.15s;
    font-family: 'DM Sans', sans-serif;
  }

  .nav-drawer-logout:hover { opacity: 0.7; }

  @media (max-width: 600px) {
    .nav-actions  { display: none; }
    .nav-hamburger { display: flex; }
  }
`;

function AppNavbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{styles}</style>

      <nav className="nav-bar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">

          {/* Wordmark */}
          <Link to="/" className="nav-wordmark" aria-label="Blog home">
            Blog<em>App</em>
          </Link>

          {/* Desktop actions */}
          <div className="nav-actions">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className={`nav-link${isActive("/login") ? " active" : ""}`}
                >
                  Login
                </Link>
                <div className="nav-sep" aria-hidden="true" />
                <Link to="/register" className="nav-cta">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`nav-link${isActive("/") ? " active" : ""}`}
                >
                  Posts
                </Link>
                <button className="nav-logout" onClick={logout} aria-label="Log out">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        <div
          id="nav-drawer"
          className={`nav-drawer${open ? " open" : ""}`}
          aria-hidden={!open}
        >
          <div className="nav-drawer-inner">
            {!token ? (
              <>
                <Link to="/login" className="nav-drawer-link">
                  Login
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <Link to="/register" className="nav-drawer-link">
                  Register
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="nav-drawer-link">
                  Posts
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <button className="nav-drawer-logout" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default AppNavbar;