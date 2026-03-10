function IconHome() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.8V20h11V9.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2 21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v10H8l-4 3V6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconNotif() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 10a6 6 0 1 1 12 0v4l2 2H4l2-2v-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c1.6-3.2 4.1-4.8 7-4.8S17.4 16.8 19 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBackShop() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6 3 12l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h12a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CommunitySideNav({ view = "home" }) {
  const isActive = (name) => String(view || "").toLowerCase() === String(name || "").toLowerCase();
  function handleCommunityHomeClick(event) {
    if (!isActive("home")) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <aside className="community-side-nav" aria-label="Community quick navigation">
      <a
        className={`community-nav-btn ${isActive("home") ? "active" : ""}`}
        href="#/community?view=home"
        title="Community Home"
        aria-label="Community Home"
        onClick={handleCommunityHomeClick}
      >
        <IconHome />
      </a>
      <a className={`community-nav-btn ${isActive("search") ? "active" : ""}`} href="#/community?view=search" title="Search" aria-label="Search">
        <IconSearch />
      </a>
      <a className={`community-nav-btn ${isActive("messages") ? "active" : ""}`} href="#/community?view=messages" title="Messages" aria-label="Messages">
        <IconMessage />
      </a>
      <a className={`community-nav-btn ${isActive("notifications") ? "active" : ""}`} href="#/community?view=notifications" title="Notifications" aria-label="Notifications">
        <IconNotif />
      </a>
      <a className={`community-nav-btn ${isActive("profile") ? "active" : ""}`} href="#/community?view=profile" title="Profile" aria-label="Profile">
        <IconProfile />
      </a>
      <a className="community-nav-btn back" href="#/shop" title="Back to E-commerce" aria-label="Back to E-commerce">
        <IconBackShop />
      </a>
    </aside>
  );
}
