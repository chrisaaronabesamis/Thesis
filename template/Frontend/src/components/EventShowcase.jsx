import { useMemo, useState } from "react";
import { toast } from "../utils/toast";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getEventStatus(eventDate) {
  const now = Date.now();
  if (!eventDate) return "TBA";
  const eventMs = eventDate.getTime();
  const diff = eventMs - now;
  if (Math.abs(diff) <= 2 * 60 * 60 * 1000) return "Now";
  if (diff > 0) return "Upcoming";
  return "Past";
}

function formatEventDate(dateObj) {
  if (!dateObj) return "Date TBA";
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(dateObj);
}

function countdownLabel(dateObj) {
  if (!dateObj) return "Waiting for event schedule";
  const diff = dateObj.getTime() - Date.now();
  if (diff <= 0) return "Event started or finished";
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${Math.max(hours, 1)}h left`;
}

export default function EventShowcase({ events = [], loading = false }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState("");

  const normalizedEvents = useMemo(
    () =>
      events.map((event) => {
        const dateObj = toDate(event.date);
        const status = getEventStatus(dateObj);
        return {
          ...event,
          dateObj,
          status,
          formattedDate: formatEventDate(dateObj),
          countdown: countdownLabel(dateObj),
        };
      }),
    [events],
  );

  const stats = useMemo(() => {
    const result = { all: normalizedEvents.length, upcoming: 0, now: 0, past: 0 };
    normalizedEvents.forEach((event) => {
      const key = String(event.status || "").toLowerCase();
      if (key === "upcoming" || key === "now" || key === "past") {
        result[key] += 1;
      }
    });
    return result;
  }, [normalizedEvents]);

  const filteredEvents = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return normalizedEvents
      .filter((event) => {
        if (filter !== "all" && String(event.status || "").toLowerCase() !== filter) return false;
        if (!lowered) return true;
        return [event.title, event.venue, event.city, event.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(lowered);
      })
      .sort((a, b) => {
        if (!a.dateObj && !b.dateObj) return 0;
        if (!a.dateObj) return 1;
        if (!b.dateObj) return -1;
        if (a.status === "Past" && b.status === "Past") return b.dateObj - a.dateObj;
        return a.dateObj - b.dateObj;
      });
  }, [normalizedEvents, filter, query]);

  function handleRemind(event) {
    const key = "fanhub_event_reminders";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const hasExisting = existing.some((item) => String(item.id) === String(event.id));
    if (!hasExisting) {
      localStorage.setItem(
        key,
        JSON.stringify([
          ...existing,
          { id: event.id, title: event.title, date: event.date, venue: event.venue },
        ]),
      );
    }
    toast.success("Event reminder saved.");
  }

  async function handleShare(event) {
    const shareText = `${event.title} - ${event.formattedDate} - ${event.venue || "Venue TBA"}`;
    try {
      await navigator.clipboard.writeText(shareText);
      toast.info("Event details copied.");
    } catch (_) {
      toast.error("Copy failed.");
    }
  }

  return (
    <section id="events" className="panel">
      <div className="events-head">
        <div>
          <h2>Events</h2>
          <p className="muted">See schedules, ticket links, venue access, and reminders.</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search event or venue"
          aria-label="Search events"
        />
      </div>

      <div className="events-filter-row">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          All ({stats.all})
        </button>
        <button type="button" className={filter === "upcoming" ? "active" : ""} onClick={() => setFilter("upcoming")}>
          Upcoming ({stats.upcoming})
        </button>
        <button type="button" className={filter === "now" ? "active" : ""} onClick={() => setFilter("now")}>
          Now ({stats.now})
        </button>
        <button type="button" className={filter === "past" ? "active" : ""} onClick={() => setFilter("past")}>
          Past ({stats.past})
        </button>
      </div>

      {loading && <p className="muted">Loading event details...</p>}
      {!loading && filteredEvents.length === 0 && <p className="muted">No events matched your filters.</p>}

      <div className="event-grid">
        {filteredEvents.map((event) => (
          <article className="event-card" key={event.id}>
            {event.image ? <img src={event.image} alt={event.title} /> : <div className="image-fallback" />}
            <div className="event-content">
              <div className="event-title-row">
                <h3>{event.title}</h3>
                <span className={`event-status ${String(event.status || "").toLowerCase()}`}>{event.status}</span>
              </div>
              <p className="muted">{event.formattedDate}</p>
              <p className="muted">{event.venue || "Venue TBA"}</p>
              <p className="muted">{event.countdown}</p>

              <div className="event-actions">
                {event.ticketLink ? (
                  <a href={event.ticketLink} target="_blank" rel="noreferrer">
                    Tickets
                  </a>
                ) : null}
                {event.venue ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}${event.city ? `, ${event.city}` : ""}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Venue Map
                  </a>
                ) : null}
                <button type="button" onClick={() => handleRemind(event)}>Remind me</button>
                <button type="button" onClick={() => handleShare(event)}>Copy</button>
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (String(prev) === String(event.id) ? "" : event.id))}
                >
                  {String(expandedId) === String(event.id) ? "Hide details" : "Details"}
                </button>
              </div>

              {String(expandedId) === String(event.id) ? (
                <div className="event-detail-box">
                  <p>{event.description || "No additional event notes yet."}</p>
                  <p className="muted">City/Municipality: {event.city || "TBA"}</p>
                  <p className="muted">Barangay/Area: {event.barangay || "TBA"}</p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
