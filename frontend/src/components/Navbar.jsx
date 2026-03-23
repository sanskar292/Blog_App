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

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif;
  }

  .nav-inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-wordmark {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: var(--ink);
    text-decoration: none;
    line-height: 1;
  }

  .nav-wordmark em { font-style: italic; color: var(--accent); }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

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

  /* Write button — pen icon + label */
  .nav-write {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: var(--radius);
    transition: color 0.15s, background 0.15s;
  }
  .nav-write:hover { color: var(--ink); background: var(--border); }
  .nav-write.active { color: var(--ink); }

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

  .nav-sep {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--border);
    margin: 0 2px;
  }

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
  .nav-logout:hover { color: var(--accent); border-color: #f5c6ba; background: #fef2ef; }

  /* Mobile */
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

  .nav-drawer {
    border-top: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }
  .nav-drawer.open { max-height: 280px; }

  .nav-drawer-inner {
    padding: 16px 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 720px;
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
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
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

          <Link to="/" className="nav-wordmark">
            Blog<em>App</em>
          </Link>

          <div className="nav-actions">
            {!token ? (
              <>
                <Link to="/login" className={`nav-link${isActive("/login") ? " active" : ""}`}>Login</Link>
                <div className="nav-sep" aria-hidden="true" />
                <Link to="/register" className="nav-cta">Register</Link>
              </>
            ) : (
              <>
                {/* Write button — only when logged in */}
                <Link to="/create" className={`nav-write${isActive("/create") ? " active" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  Write
                </Link>

                <div className="nav-sep" aria-hidden="true" />

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

          <button
            className="nav-hamburger"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        <div className={`nav-drawer${open ? " open" : ""}`} aria-hidden={!open}>
          <div className="nav-drawer-inner">
            {!token ? (
              <>
                <Link to="/login" className="nav-drawer-link">
                  Login
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <Link to="/register" className="nav-drawer-link">
                  Register
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link to="/create" className="nav-drawer-link">
                  Write a story
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <Link to="/" className="nav-drawer-link">
                  All stories
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <button className="nav-drawer-logout" onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default AppNavbar;