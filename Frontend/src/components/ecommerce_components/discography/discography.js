export default function Discography(root) {
  root.innerHTML += `
  <section id="music" class="discography-section">
      <h2 class="section-title">Discography</h2>
      <div class="album-carousel">
        <button class="carousel-btn prev" id="prevAlbumBtn" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="album-container">
          <div class="album-card active">
            <a href="https://open.spotify.com/album/2eT1XApzS0GmkJLMlCBdVv?si=qiwp9xmETUmiCz-uA3Lsmw" target="_blank">
              <img src="https://res.cloudinary.com/dfuglnaz2/image/upload/v1759407989/1000010188_jnxkxm.jpg" alt="Taalarawan">
              <h3>Taalarawan</h3>
              <p>Album • 2024 • 6 Songs</p>
            </a>
          </div>
          <div class="album-card">
            <a href="https://open.spotify.com/album/28rgW6IXDsrk4YtTcFtGGK?si=9u2C8POCQHGARniou2VHQw" target="_blank">
              <img src="https://res.cloudinary.com/dfuglnaz2/image/upload/v1759489337/Born_To_Win_studio_album_cover_rf7nb6.webp" alt="Born to Win">
              <h3>Born to Win</h3>
              <p>Album • 2021 • 12 Songs</p>
            </a>
          </div>
          <div class="album-card">
            <a href="https://open.spotify.com/album/7H64wogfyQUcRqFZFbMV9S?si=GhN_pdJLTsutFE8198iu7g" target="_blank">
              <img src="https://res.cloudinary.com/dfuglnaz2/image/upload/v1759413934/Feel_Good_Album_Cover_klqhoh.webp" alt="Feel Good">
              <h3>Feel Good</h3>
              <p>EP • 2022 • 5 Songs</p>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" id="nextAlbumBtn" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  `;

  // === Logic ===
  let currentAlbum = 0;
  let albumInterval;
  let albums = [];
  const nextBtn = root.querySelector("#nextAlbumBtn");
  const prevBtn = root.querySelector("#prevAlbumBtn");
  const carousel = root.querySelector(".album-carousel");

  // Initialize album elements after DOM insertion to avoid timing issues
  function init() {
    albums = Array.from(root.querySelectorAll(".album-card"));
    // if no albums found, try again shortly (handles some render timing edge cases)
    if (!albums.length) {
      setTimeout(() => {
        albums = Array.from(root.querySelectorAll(".album-card"));
        showAlbum(0);
        setTimeout(startAutoCarousel, 500);
      }, 20);
      return;
    }
    showAlbum(0);
  }

  // Update visual positions for all albums based on currentAlbum
  function updateAlbumPositions() {
    if (!albums.length) return;
    const len = albums.length;

    albums.forEach((album, index) => {
      // compute neighbors (circular)
      const nextIndex = (currentAlbum + 1) % len;
      const prevIndex = (currentAlbum - 1 + len) % len;

      album.classList.remove('active');
      album.style.pointerEvents = 'none';

      if (index === currentAlbum) {
        // center / active
        album.style.transform = 'translate(-50%, -50%) translateX(0) scale(1)';
        album.style.opacity = '1';
        album.style.zIndex = '3';
        album.classList.add('active');
        album.style.pointerEvents = 'auto';
      } else if (index === nextIndex) {
        // right
        album.style.transform = 'translate(-50%, -50%) translateX(120%) scale(0.85)';
        album.style.opacity = '0.6';
        album.style.zIndex = '2';
      } else if (index === prevIndex) {
        // left
        album.style.transform = 'translate(-50%, -50%) translateX(-120%) scale(0.85)';
        album.style.opacity = '0.6';
        album.style.zIndex = '2';
      } else {
        // offscreen / hidden
        album.style.transform = 'translate(-50%, -50%) translateX(0) scale(0.7)';
        album.style.opacity = '0';
        album.style.zIndex = '1';
      }

      // smooth transition
      album.style.transition = 'transform 0.45s ease, opacity 0.45s ease';
    });

    // debug: log current positions (remove in production)
    // console.debug('discography positions', { currentAlbum, transforms: albums.map(a => a.style.transform) });
  }

  function showAlbum(n) {
    if (!albums.length) return;
    currentAlbum = (n + albums.length) % albums.length;
    updateAlbumPositions();
  }

  function nextAlbum() {
    showAlbum(currentAlbum + 1);
  }

  function prevAlbum() {
    showAlbum(currentAlbum - 1);
  }

  function startAutoCarousel() {
    stopAutoCarousel(); // Clear any existing interval
    albumInterval = setInterval(nextAlbum, 3000);
  }

  function stopAutoCarousel() {
    if (albumInterval) {
      clearInterval(albumInterval);
      albumInterval = null;
    }
  }

  // === Init ===
  // Initialize album list and set positions after the component is rendered
  setTimeout(() => {
    init();
    // Attach event listeners after DOM is ready and albums/buttons exist
    const nextBtn2 = root.querySelector("#nextAlbumBtn");
    const prevBtn2 = root.querySelector("#prevAlbumBtn");
    const carousel2 = root.querySelector(".album-carousel");
    if (carousel2) {
      carousel2.addEventListener("mouseenter", stopAutoCarousel);
      carousel2.addEventListener("mouseleave", startAutoCarousel);
    }
    if (nextBtn2) {
      nextBtn2.addEventListener("click", () => {
        nextAlbum();
        stopAutoCarousel();
      });
    }
    if (prevBtn2) {
      prevBtn2.addEventListener("click", () => {
        prevAlbum();
        stopAutoCarousel();
      });
    }
    // Start auto-carousel with a slight delay
    setTimeout(startAutoCarousel, 700);
  }, 0);
}
