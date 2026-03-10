export default function AnnouncementSection({ announcements = [], loading = false }) {
  return (
    <section id="announcement" className="panel">
      <h2>Announcement</h2>
      <p className="muted">Connected to admin-managed threads in backend.</p>
      {loading ? <p className="muted">Loading announcements...</p> : null}
      {!loading && announcements.length === 0 ? <p className="muted">No announcements yet.</p> : null}
      <div className="announcement-grid">
        {announcements.map((item) => (
          <article key={item.id} className={`announcement-card ${item.pinned ? "pinned" : ""}`}>
            <h3>{item.title}</h3>
            <p className="muted">{[item.venue, item.date].filter(Boolean).join(" | ")}</p>
            <p className="muted">By {item.author}{item.pinned ? " | Pinned" : ""}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
