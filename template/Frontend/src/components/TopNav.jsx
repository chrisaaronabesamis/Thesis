import { useEffect, useState } from "react";

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2 11h10l2-7H7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconOrder() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9h8M8 13h8M8 17h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c1.6-3.2 4.1-4.8 7-4.8S17.4 16.8 19 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function TopNav({ route = "home", section = "", isLoggedIn = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (target) => route === target;
  const isHomeSectionActive = (target) => route === "home" && section === target;

  useEffect(() => {
    const onHashChange = () => setMenuOpen(false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <header className="top-nav">
      <div className="brand-wrap">
        <a className="brand-link" href="#/home" aria-label="BINI home">
          <img
            src="https://res.cloudinary.com/dv7b0rwzl/image/upload/v1771947212/BINI_logo.svg_cmyyvy.png"
            alt="BINI"
            className="brand-logo"
          />
        </a>
      </div>
      <button
        type="button"
        className={`hamburger-btn ${menuOpen ? "active" : ""}`}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`top-nav-links ${menuOpen ? "open" : ""}`}>
        <a className={isActive("home") && !section ? "active" : ""} href="#/home">Home</a>
        <a className={isHomeSectionActive("about") ? "active" : ""} href="#/home?section=about">About</a>
        <a className={isHomeSectionActive("discography") ? "active" : ""} href="#/home?section=discography">Discography</a>
        <a className={isHomeSectionActive("events") ? "active" : ""} href="#/home?section=events">Events</a>
        <a className={isHomeSectionActive("announcement") ? "active" : ""} href="#/home?section=announcement">Announcement</a>
        <a className={isActive("shop") ? "active" : ""} href="#/shop">Shop</a>
        <a className={isActive("community") ? "active" : ""} href="#/community">Community</a>
      </nav>
      <div className={`top-actions top-actions-dock ${menuOpen ? "open" : ""}`}>
        {isLoggedIn ? (
          <>
            <a className="icon-link" href="#/shop?view=cart" aria-label="Open Cart">
              <IconCart />
            </a>
            <a className="icon-link" href="#/shop?view=orders" aria-label="Open Order History">
              <IconOrder />
            </a>
          </>
        ) : null}
        <a className="icon-link auth-icon-link" href="#/login" aria-label="Open Login and Signup">
          <IconUser />
        </a>
      </div>
    </header>
  );
}
