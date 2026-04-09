import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./MobileSidebar.css";

function MobileSidebar({ isOpen, onClose, activeFilter, onFilterChange, isGlobal = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleFilterClick = (filter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
    onClose();
    if (location.pathname !== "/home") {
      navigate("/home");
    }
  };

  const handleNavClick = (path) => {
    onClose();
    navigate(path);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <button 
            className="mobile-sidebar-close-btn" 
            onClick={handleClose}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="mobile-sidebar-logo">Versa</span>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="mobile-sidebar-search">
          <span className="material-symbols-outlined mobile-search-icon">search</span>
          <input 
            type="text" 
            placeholder="Search articles, poetry, stories..."
            className="mobile-search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
                onClose();
              }
            }}
          />
        </div>

        {/* Navigation Menu */}
        <nav className="mobile-sidebar-nav">
          {isGlobal ? (
            <>
              <button
                className="mobile-nav-item"
                onClick={() => handleNavClick("/home")}
              >
                <span className="material-symbols-outlined">home</span>
                Home
              </button>
              <button
                className={`mobile-nav-item ${location.pathname === '/articles' ? 'active' : ''}`}
                onClick={() => handleNavClick("/articles")}
              >
                <span className="material-symbols-outlined">article</span>
                Articles
              </button>
              <button
                className={`mobile-nav-item ${location.pathname === '/poetry' ? 'active' : ''}`}
                onClick={() => handleNavClick("/poetry")}
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Poetry
              </button>
              <button
                className={`mobile-nav-item ${location.pathname === '/stories' ? 'active' : ''}`}
                onClick={() => handleNavClick("/stories")}
              >
                <span className="material-symbols-outlined">auto_stories</span>
                Stories
              </button>
            </>
          ) : (
            <>
              <button
                className={`mobile-nav-item ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => handleFilterClick("all")}
              >
                <span className="material-symbols-outlined">home</span>
                Home
              </button>
              <button
                className={`mobile-nav-item ${activeFilter === "articles" ? "active" : ""}`}
                onClick={() => handleFilterClick("articles")}
              >
                <span className="material-symbols-outlined">article</span>
                Articles
              </button>
              <button
                className={`mobile-nav-item ${activeFilter === "poetry" ? "active" : ""}`}
                onClick={() => handleFilterClick("poetry")}
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Poetry
              </button>
              <button
                className={`mobile-nav-item ${activeFilter === "stories" ? "active" : ""}`}
                onClick={() => handleFilterClick("stories")}
              >
                <span className="material-symbols-outlined">auto_stories</span>
                Stories
              </button>
            </>
          )}
        </nav>

        <div className="mobile-sidebar-divider"></div>

        {/* User Actions (Mobile) */}
        <div className="mobile-sidebar-footer">
          {!token ? (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="mobile-btn mobile-btn-outline" onClick={onClose}>
                Sign In
              </Link>
              <Link to="/register" className="mobile-btn mobile-btn-primary" onClick={onClose}>
                Get Started
              </Link>
            </div>
          ) : (
            <div className="mobile-user-actions">
              <button className="mobile-nav-item" onClick={() => handleNavClick("/create")}>
                <span className="material-symbols-outlined">article</span>
                Write Article
              </button>
              <button className="mobile-nav-item" onClick={() => handleNavClick("/poetry/create")}>
                <span className="material-symbols-outlined">auto_awesome</span>
                Write Poetry
              </button>
              <button className="mobile-nav-item" onClick={() => handleNavClick("/stories")}>
                <span className="material-symbols-outlined">auto_stories</span>
                Write Story
              </button>
              <button className="mobile-nav-item" onClick={() => handleNavClick("/profile")}>
                <span className="material-symbols-outlined">person</span>
                Profile
              </button>
            </div>
          )}
          <div className="mobile-sidebar-footer-text">
            <p>© 2026 Versa Editorial</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default MobileSidebar;
