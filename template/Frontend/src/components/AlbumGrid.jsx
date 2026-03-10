export default function AlbumGrid({
  albums = [],
  loading = false,
  selectedAlbumId = null,
  onAlbumSelect,
  tracks = [],
  tracksLoading = false,
}) {
  return (
    <section id="discography" className="panel">
      <h2>Discography</h2>
      {loading && <p className="muted">Loading albums...</p>}
      {!loading && albums.length === 0 && <p className="muted">No albums available yet.</p>}
      <div className="album-grid">
        {albums.map((album) => (
          <article
            className={`album-card ${selectedAlbumId === album.id ? "active" : ""}`}
            key={album.id}
          >
            {album.cover ? <img src={album.cover} alt={album.title} /> : <div className="image-fallback" />}
            <div>
              <h3>{album.title}</h3>
              <p className="muted">{album.year || "Latest release"}</p>
              <button type="button" onClick={() => onAlbumSelect?.(album.id)}>
                {selectedAlbumId === album.id ? "Selected" : "View tracks"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {selectedAlbumId ? (
        <div className="track-panel">
          <h3>Track List</h3>
          {tracksLoading ? <p className="muted">Loading tracks...</p> : null}
          {!tracksLoading && tracks.length === 0 ? <p className="muted">No tracks found for this album.</p> : null}
          {!tracksLoading && tracks.length > 0 ? (
            <ul>
              {tracks.map((track) => (
                <li key={track.id}>
                  <span>{track.title}</span>
                  <span className="muted">{track.duration || "-"}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
