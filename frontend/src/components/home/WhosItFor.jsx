const AUDIENCES = [
  { icon: '🧒', label: 'Kids' },
  { icon: '💞', label: 'Couples' },
  { icon: '🤝', label: 'Friends' },
  { icon: '👨‍👩‍👧', label: 'Family' },
  { icon: '🎉', label: 'Parties' },
  { icon: '🎁', label: 'Gift Lovers' },
  { icon: '📸', label: 'Creators' },
  { icon: '✨', label: 'Everyday Fun' },
];

export default function WhosItFor() {
  return (
    <section className="section" id="why">
      <div className="container">
        <div className="center" style={{ marginBottom: 26 }}>
          <div className="eyebrow">Made For Everyone</div>
          <h2>Who&rsquo;s It For?</h2>
          <p style={{ maxWidth: 560, margin: '0 auto' }}>
            A little glow, a lot of bubbles — and a moment worth remembering, whoever you are.
          </p>
        </div>
        <div className="grid grid--cards">
          {AUDIENCES.map((a) => (
            <div className="card" key={a.label} style={{ padding: '20px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.9rem' }} aria-hidden="true">{a.icon}</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
