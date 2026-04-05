// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./LandingPage.css";

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsLoggedIn(!!token);
//   }, []);

//   const handleRead    = () => navigate("/home");
//   const handleSignIn  = () => navigate("/login");
//   const handleWrite   = () => navigate(isLoggedIn ? "/create" : "/register");

//   return (
//     <div className="landing-page">
//       {/* ── Nav – untouched ── */}
//       <nav className="landing-nav">
//         <span className="nav-logo">Versa</span>
//         <div className="nav-actions">
//           {!isLoggedIn && (
//             <button className="btn-signin" onClick={handleSignIn}>Sign in</button>
//           )}
//           <button className="btn-started" onClick={handleWrite}>
//             {isLoggedIn ? "Write" : "Get started"}
//           </button>
//         </div>
//       </nav>

//       {/* ── Hero ── */}
//       <main className="hero">
//         {/* background photo */}
//         <img
//           className="hero-bg"
//           src="https://images.unsplash.com/photo-1519219788971-8d9797e0928e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFibGV8ZW58MHx8MHx8fDA%3D"
//           alt=""
//           aria-hidden="true"
//         />

//         {/* left gradient veil so text is readable */}
//         <div className="hero-veil" />

//         {/* text block */}
//         <div className="hero-content">
//           <p className="hero-kicker">Where words begin</p>
//           <h1 className="hero-heading">
//             Articles, Poetry<br />&amp; Stories
//           </h1>
//           <p className="hero-sub">
//             Discover a curated space for thoughtful<br />
//             writing and creative expression.
//           </p>
//           <div className="hero-cta-row">
//             <button className="btn-cta" onClick={handleRead}>
//               Explore words
//             </button>
//             {!isLoggedIn && (
//               <button className="btn-ghost" onClick={handleSignIn}>
//                 Sign in
//               </button>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default LandingPage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // FIX: matched to actual filename (was "./landing.css" — breaks case-sensitive bundlers)

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleRead = () => navigate("/home");
  const handleSignIn = () => navigate("/login");
  const handleWrite = () => navigate(isLoggedIn ? "/create" : "/register");

  return (
    <div className="landing-page">
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <span className="nav-logo">Versa</span>
        <div className="nav-actions">
          {!isLoggedIn && (
            <button className="btn-signin" onClick={handleSignIn}>Sign in</button>
          )}
          <button className="btn-started" onClick={handleWrite}>
            {isLoggedIn ? "Write" : "Get started"}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="hero">
        {/*
          FIX: removed <img className="hero-bg" /> entirely.
          It pointed to a *different* Unsplash URL than the CSS background-image,
          meaning two separate photos were being fetched — one wasted. The CSS
          background-image is the single source of truth; the img tag was hidden anyway.
        */}

        {/* Left gradient veil so text is readable */}
        <div className="hero-veil" aria-hidden="true" />

        {/* Text block */}
        <div className="hero-content">
          <p className="hero-kicker">Where words begin</p>

          {/*
            FIX: removed <br /> tags — heading wraps naturally via max-width on
            .hero-content. Hard-coded breaks break on mobile.
          */}
          <h1 className="hero-heading">
            Articles, Poetry &amp; Stories
          </h1>

          {/*
            FIX: removed <br /> — line length is controlled by max-width on .hero-sub
          */}
          <p className="hero-sub">
            Discover a curated space for thoughtful writing and creative expression.
          </p>

          <div className="hero-cta-row">
            <button className="btn-cta" onClick={handleRead}>
              Explore words
            </button>
            {/*
              FIX: removed duplicate ghost "Sign in" button.
              The nav already has a Sign in button — showing it again in the hero
              was redundant and cluttered the CTA row.
            */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;