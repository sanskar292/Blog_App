import AppNavbar from "./Navbar";

function Layout({ children }) {
  return (
    <>
      <AppNavbar />
      <div className="app-main-content">
        {children}
      </div>
    </>
  );
}

export default Layout;
