import { Link } from 'react-router-dom';
import Bubbles from '../Bubbles';
import { useStore } from '../../context/StoreContext';

export default function Hero() {
  const { settings, products } = useStore();
  const hero = products[0]?.hero;

  return (
    <section className="hero">
      <Bubbles />
      <div className="container hero__grid">
        <div className="hero__copy">
          <div className="eyebrow">Bubble Gifts · Fun · Magic</div>
          <h1>
            <span className="gradient-text">{settings.heroHeadline || 'Make Moments Magical.'}</span>
          </h1>
          <p style={{ fontSize: '1.05rem', maxWidth: 520 }}>
            {settings.heroSubheadline}
          </p>
          <div className="hero__cta">
            <Link to="/#shop" className="btn btn--primary">SHOP THE BUBBLE DROP</Link>
            <Link to="/#shop" className="btn btn--ghost">EXPLORE PRODUCTS</Link>
          </div>
          <p className="hint" style={{ marginTop: 16 }}>
            Cash on Delivery available · Every order confirmed by a quick call
          </p>
        </div>

        <div className="hero__media">
          {hero && (
            <img
              src={hero.url}
              srcSet={hero.srcset}
              sizes="(max-width: 900px) 100vw, 560px"
              alt="BUBBLO bubble wand"
              width="1200"
              height="900"
              fetchpriority="high"
            />
          )}
        </div>
      </div>
    </section>
  );
}
