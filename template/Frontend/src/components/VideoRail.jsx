export default function VideoRail({ videos = [], loading = false }) {
  return (
    <section id="videos" className="panel">
      <h2>Featured Videos</h2>
      {loading && <p className="muted">Loading videos...</p>}
      {!loading && videos.length === 0 && <p className="muted">No videos available yet.</p>}
      <div className="video-grid">
        {videos.map((video) => (
          <article className="video-card" key={video.id}>
            {video.thumbnail ? <img src={video.thumbnail} alt={video.title} /> : <div className="image-fallback" />}
            <div className="video-content">
              <h3>{video.title}</h3>
              <a href={video.url} target="_blank" rel="noreferrer">Watch now</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
