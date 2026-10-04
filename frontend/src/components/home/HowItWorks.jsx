const STEPS = [
  { n: 1, title: 'Pick your bubble', text: 'Choose the wand or gun that fits your moment.' },
  { n: 2, title: 'Place your COD order', text: 'Fill the form and place your order — no OTP, no waiting.' },
  { n: 3, title: 'We call to confirm', text: 'We ring you to confirm the order, then it is on its way.' },
];

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: 'var(--off-white)' }}>
      <div className="container">
        <div className="center" style={{ marginBottom: 24 }}>
          <div className="eyebrow">How It Works</div>
          <h2>Three Simple Steps</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="step__n">{s.n}</div>
              <h3 style={{ fontSize: '1.05rem' }}>{s.title}</h3>
              <p style={{ margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
