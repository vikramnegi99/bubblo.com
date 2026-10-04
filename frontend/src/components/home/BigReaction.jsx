import { Link } from 'react-router-dom';

/** "Small Thing. Big Reaction." banner. */
export default function BigReaction() {
  return (
    <section className="section">
      <div className="container">
        <div
          style={{
            background: 'var(--grad-brand)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ color: '#fff' }}>Small Thing. Big Reaction.</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 560, margin: '0 auto 20px' }}>
            It starts with a bubble and ends with a smile you will remember. That is the whole idea.
          </p>
          <Link to="/#shop" className="btn btn--soft">SHOP THE BUBBLE DROP</Link>
        </div>
      </div>
    </section>
  );
}
