import { useEffect, useMemo, useState } from "react";

const DEFAULT_VIDEO_ID = "ew4HfA4oQf0";

export default function HomeSection({
  stats = { albums: 0, products: 0, events: 0, announcements: 0 },
}) {
  const [videoId, setVideoId] = useState(import.meta.env.VITE_YT_VIDEO_ID || DEFAULT_VIDEO_ID);

  useEffect(() => {
    const apiKey = String(import.meta.env.VITE_YT_API_KEY || import.meta.env.VITE_API_KEY || "").trim();
    const query = String(import.meta.env.VITE_YT_QUERY || "BINI Official MV").trim();
    if (!apiKey || apiKey.toLowerCase() === "thread") {
      setVideoId(import.meta.env.VITE_YT_VIDEO_ID || DEFAULT_VIDEO_ID);
      return;
    }

    let cancelled = false;
    async function loadFeaturedVideo() {
      try {
        const url =
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance` +
          `&maxResults=1&q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || data?.error) throw new Error("YT API request failed");
        const nextId = data?.items?.[0]?.id?.videoId;
        if (!cancelled && nextId) {
          setVideoId(nextId);
        }
      } catch (_) {
        if (!cancelled) setVideoId(import.meta.env.VITE_YT_VIDEO_ID || DEFAULT_VIDEO_ID);
      }
    }
    loadFeaturedVideo();
    return () => {
      cancelled = true;
    };
  }, []);

  const embedSrc = useMemo(
    () =>
      `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&controls=1&loop=1&playlist=${encodeURIComponent(videoId)}&modestbranding=1&rel=0`,
    [videoId],
  );

  return (
    <section id="home" className="panel">
      <article className="home-video-banner">
        <iframe
          src={embedSrc}
          title="Featured Artist Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="home-video-overlay">
          <h2 className="watch-release-title">Watch latest release</h2>
        </div>
      </article>

      {/* KPI cards removed per request (Albums, Products, Events, Announcements) */}
    </section>
  );
}
