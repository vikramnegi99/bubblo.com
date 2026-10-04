import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function GiftingSection() {
  const { products } = useStore();
  const img = (products[2] || products[0])?.lifestyle || (products[2] || products[0])?.hero;

  return (
    <section className="section" style={{ background: '#fff' }}>
      <div className="container grid grid--2" style={{ alignItems: 'center' }}>
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          {img && (
            <img
              src={img.url}
              srcSet={img.srcset}
              sizes="(max-width: 820px) 100vw, 560px"
              alt="BUBBLO gift"
              loading="lazy"
            />
          )}
        </div>
        <div>
          <div className="eyebrow">Gifting</div>
          <h2>Not Just A Toy. It&rsquo;s A Moment.</h2>
          <p>
            The glow, the bubbles, the instant smile — BUBBLO gifts are made to be remembered.
            Beautiful to look at, easy to use, and ready to make any occasion feel special.
          </p>
          <ul style={{ paddingLeft: 18, color: 'var(--ink-soft)', lineHeight: 1.9 }}>
            <li>Gift-worthy designs that get an instant reaction</li>
            <li>Reusable and refillable — the magic keeps going</li>
            <li>Cash on Delivery, confirmed by a quick call</li>
          </ul>
          <Link to="/#shop" className="btn btn--primary" style={{ marginTop: 12 }}>GIFT THE FUN</Link>
        </div>
      </div>
    </section>
  );
}
