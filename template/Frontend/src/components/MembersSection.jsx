const MEMBER_CARDS = [
  { id: "member-1", name: "Member One", role: "Lead Vocal", about: "Power vocals and fan-first energy." },
  { id: "member-2", name: "Member Two", role: "Main Dancer", about: "Sharp choreography and dynamic stage movement." },
  { id: "member-3", name: "Member Three", role: "Rapper", about: "Confident flow and standout performance style." },
  { id: "member-4", name: "Member Four", role: "Visual", about: "Signature visuals with polished stage presence." },
];

export default function MembersSection() {
  return (
    <section id="members" className="panel">
      <h2>Members</h2>
      <div className="member-grid">
        {MEMBER_CARDS.map((member) => (
          <article key={member.id} className="member-card">
            <h4>{member.name}</h4>
            <p className="muted">{member.role}</p>
            <p>{member.about}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
