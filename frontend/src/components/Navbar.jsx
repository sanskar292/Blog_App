import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getLoggedInUser } from "../api";
import "./Navbar.css"

function AppNavbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState(null);
  const [showWriteDropdown, setShowWriteDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");

  // Dispatch custom event to open mobile sidebar
  const handleMobileMenuClick = () => {
    window.dispatchEvent(new CustomEvent('openMobileSidebar'));
  };

  useEffect(() => {
    setUsername(getLoggedInUser());
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWriteDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsername(null);
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          {/* Mobile Menu Button */}
          <button 
            className="navbar-mobile-menu-btn" 
            onClick={handleMobileMenuClick}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Logo */}
          <Link to="/home" className="navbar-logo">
            Versa
          </Link>

          {/* Search Feature */}
          <div className="navbar-search-container">
            <span className="material-symbols-outlined navbar-search-icon">search</span>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          {/* Right Actions */}
          <div className="navbar-actions-right">
            {!token ? (
              <>
                <Link to="/login" className="navbar-btn" style={{ color: 'var(--on-surface-variant)' }}>
                  Sign In
                </Link>
                <Link to="/register" className="navbar-btn navbar-btn-primary">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* Write Option with Dropdown */}
                <div className="navbar-dropdown-container" ref={dropdownRef}>
                  <button 
                    className="navbar-btn navbar-btn-primary"
                    onClick={() => setShowWriteDropdown(!showWriteDropdown)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit_square</span>
                    Write
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                      {showWriteDropdown ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  
                  {showWriteDropdown && (
                    <div className="navbar-dropdown-menu">
                      <Link to="/create" className="navbar-dropdown-item" onClick={() => setShowWriteDropdown(false)}>
                        <span className="material-symbols-outlined">article</span>
                        Article
                      </Link>
                      <Link to="/poetry/create" className="navbar-dropdown-item" onClick={() => setShowWriteDropdown(false)}>
                        <span className="material-symbols-outlined">auto_awesome</span>
                        Poetry
                      </Link>
                      <Link to="/stories" className="navbar-dropdown-item" onClick={() => setShowWriteDropdown(false)}>
                        <span className="material-symbols-outlined">auto_stories</span>
                        Story
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Page */}
                <Link to="/profile" className="navbar-profile-link">
                  <div className="navbar-profile-avatar">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span style={{ display: 'none' }}>{username}</span>
                </Link>

                {/* Logout */}
                <button className="navbar-icon-btn" onClick={logout} title="Logout">
                  <span className="material-symbols-outlined">logout</span>
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