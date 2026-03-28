import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getLoggedInUser } from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink: #1a1a18;
    --paper: #f5f2eb;
    --muted: #9b9689;
    --accent: #c8502a;
    --poetry-accent: #7c5cb8;
    --surface: #fffdf8;
    --border: #e2ded4;
    --radius: 6px;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif;
    backdrop-filter: blur(8px);
  }

  .nav-inner {
    max-width: 840px;
    margin: 0 auto;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-wordmark {
    font-family: 'Instrument Serif', serif;
    font-size: 1.4rem;
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
    gap: 8px;
  }

  .nav-poetry-link {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    padding: 8px 14px;
    border-radius: var(--radius);
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nav-poetry-link:hover { color: var(--poetry-accent); background: rgba(124, 92, 184, 0.1); }
  .nav-poetry-link.active { color: var(--poetry-accent); }

  .nav-link {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    padding: 8px 14px;
    border-radius: var(--radius);
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nav-link:hover { color: var(--ink); background: rgba(155, 150, 137, 0.1); }
  .nav-link.active { color: var(--ink); }

  .nav-write {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--surface);
    background: var(--ink);
    text-decoration: none;
    padding: 9px 18px;
    border-radius: var(--radius);
    transition: all 0.15s;
  }
  .nav-write:hover { background: #2e2e2b; transform: translateY(-1px); }
  .nav-write.active { background: #2e2e2b; }

  .nav-sep {
    width: 1px;
    height: 20px;
    background: var(--border);
    margin: 0 4px;
  }

  .nav-logout {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 16px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: all 0.15s;
  }
  .nav-logout:hover { color: var(--accent); border-color: var(--accent); background: rgba(200, 80, 42, 0.05); }

  /* Mobile */
  .nav-hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: var(--ink);
    border-radius: var(--radius);
    transition: background 0.15s;
  }
  .nav-hamburger:hover { background: rgba(155, 150, 137, 0.1); }

  .nav-drawer {
    border-top: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }
  .nav-drawer.open { max-height: 320px; }

  .nav-drawer-inner {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 840px;
    margin: 0 auto;
  }

  .nav-drawer-link {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--ink);
    text-decoration: none;
    padding: 12px 0;
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
    font-weight: 500;
    color: var(--accent);
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    padding: 12px 0;
    cursor: pointer;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
  }
  .nav-drawer-logout:hover { opacity: 0.7; }

  @media (max-width: 640px) {
    .nav-actions  { display: none; }
    .nav-hamburger { display: flex; }
    .nav-write span { display: none; }
  }
`;

function AppNavbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setUsername(getLoggedInUser());
  }, [token]);

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
            <Link to="/poetry" className={`nav-poetry-link${isActive("/poetry") ? " active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              </svg>
              Poetry
            </Link>
            {!token ? (
              <>
                <Link to="/login" className={`nav-link${isActive("/login") ? " active" : ""}`}>
                  Login
                </Link>
                <div className="nav-sep" aria-hidden="true" />
                <Link to="/register" className="nav-write">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className={`nav-link${isActive("/profile") ? " active" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {username || "Profile"}
                </Link>

                <div className="nav-sep" aria-hidden="true" />

                <Link to="/create" className={`nav-write${isActive("/create") ? " active" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Write</span>
                </Link>

                <div className="nav-sep" aria-hidden="true" />

                <button className="nav-logout" onClick={logout} aria-label="Log out">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
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
                <Link to="/poetry" className="nav-drawer-link">
                  Poetry
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
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
                <Link to="/poetry" className="nav-drawer-link">
                  Poetry
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <Link to="/profile" className="nav-drawer-link">
                  Profile
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </Link>
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