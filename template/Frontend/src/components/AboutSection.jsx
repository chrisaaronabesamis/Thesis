import { useMemo, useState } from "react";

export default function AboutSection({ about = null, members = [] }) {
  const [k, setK] = useState(0);
  const list = useMemo(() => (Array.isArray(members) ? members : []), [members]);
  const n = list.length;
  const safeIndex = ((k % Math.max(n, 1)) + Math.max(n, 1)) % Math.max(n, 1);
  const topMember = list[safeIndex] || null;

  function move(step) {
    if (!n) return;
    setK((prev) => (prev + step + n) % n);
  }

  return (
    <section id="about" className="panel">
      <h2>About</h2>
      <article className="member-info-card">
        <h3>About the Artist</h3>
        <p className="muted">
          {about?.description || "Artist profile unavailable."}
        </p>
      </article>

      {topMember ? (
        <section className="about-stack" style={{ "--k": safeIndex, "--n": n }}>
          <p className="about-counter">
            {safeIndex + 1}/{n}
          </p>
          <div className="about-media">
            <button type="button" className="about-nav-btn prev" onClick={() => move(-1)} aria-label="Previous member">
              <span />
            </button>

            {list.map((member, index) => {
              const rel = (index - safeIndex + n) % n;
              const depth = Math.min(rel, 3);
              const scale = 1 - depth * 0.06;
              const offsetX = depth * 20;
              const offsetY = depth * 10;
              const opacity = rel === 0 ? 1 : 0.85 - depth * 0.16;
              return (
                <article
                  key={member.id || member.name || index}
                  className={`about-card ${rel === 0 ? "active" : ""}`}
                  style={{
                    zIndex: n - depth,
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                    opacity,
                  }}
                >
                  {member.image ? <img src={member.image} alt={member.name} /> : <div className="image-fallback" />}
                </article>
              );
            })}

            <button type="button" className="about-nav-btn next" onClick={() => move(1)} aria-label="Next member">
              <span />
            </button>
          </div>
          <h3>{topMember.name}</h3>
          <em>{topMember.role}</em>
          <p className="muted about-copy">{topMember.description}</p>
        </section>
      ) : null}
    </section>
  );
}
