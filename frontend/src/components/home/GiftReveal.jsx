import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

/** Gift-opening animation. Honours prefers-reduced-motion (reveal is instant). */
export default function GiftReveal() {
  const { products } = useStore();
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const featured = products[2] || products[0];

  return (
    <section className="section" id="gifting">
      <div className="container">
        <div className={`gift ${open ? 'gift--open' : ''}`}>
          <div className="eyebrow">Gifting</div>
          <h2>Some Gifts Just Hit Different.</h2>
          <p style={{ maxWidth: 560, margin: '0 auto 22px' }}>
            Wrap it, hand it over, and watch the reaction. BUBBLO gifts are made for that exact moment.
          </p>

          {!open && (
            <button className="btn btn--primary" onClick={() => setOpen(true)}>OPEN THE GIFT</button>
          )}

          <div className="gift__box" style={{ marginTop: 26 }} aria-hidden="true">
            <svg viewBox="0 0 260 220" width="100%" role="img">
              <defs>
                <linearGradient id="gbox" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c026d3" />
                  <stop offset="100%" stopColor="#5b0b45" />
                </linearGradient>
              </defs>
              <ellipse className="gift__glow" cx="130" cy="70" rx="90" ry="46" fill="rgba(34,211,238,0.28)" />
              <rect x="55" y="96" width="150" height="104" rx="14" fill="url(#gbox)" />
              <rect x="120" y="96" width="20" height="104" fill="#ffd6ea" />
              <g className="gift__lid">
                <rect x="44" y="66" width="172" height="40" rx="12" fill="#e879f9" />
                <rect x="120" y="66" width="20" height="40" fill="#ffd6ea" />
                <path d="M130 66 C 108 40, 78 44, 96 66 Z" fill="#ff9ecb" />
                <path d="M130 66 C 152 40, 182 44, 164 66 Z" fill="#ff9ecb" />
              </g>
            </svg>
          </div>

          <div className="gift__reveal">
            {featured && (
              <div style={{ maxWidth: 420, margin: '0 auto' }}>
                <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                  <img
                    src={featured.hero?.url}
                    srcSet={featured.hero?.srcset}
                    sizes="(max-width: 820px) 90vw, 420px"
                    alt={featured.name}
                    loading="lazy"
                  />
                </div>
                <h3 style={{ marginTop: 14 }}>{featured.name}</h3>
                <p className="muted">The kind of gift that gets an instant reaction.</p>
                <Link to="/#shop" className="btn btn--primary">CHOOSE YOUR BUBBLE</Link>
              </div>
            )}
          </div>

          {reduced && !open && <p className="hint">Reduced motion is on — the reveal is instant.</p>}
        </div>
      </div>
    </section>
  );
}
