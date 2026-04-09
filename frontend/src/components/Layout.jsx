import { useState, useEffect } from "react";
import AppNavbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Listen for custom event to open mobile sidebar from Navbar
  useEffect(() => {
    const handleOpenMobileSidebar = () => {
      setShowMobileSidebar(true);
    };
    
    window.addEventListener('openMobileSidebar', handleOpenMobileSidebar);
    return () => window.removeEventListener('openMobileSidebar', handleOpenMobileSidebar);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [location.pathname]);

  return (
    <>
      <AppNavbar />
      <MobileSidebar 
        isOpen={showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)}
        isGlobal={true}
      />
      <div className="app-main-content">
        {children}
      </div>
    </>
  );
}

export default Layout;
