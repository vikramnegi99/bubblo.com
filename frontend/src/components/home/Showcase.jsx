import { useStore } from '../../context/StoreContext';
import ProductCard from '../ProductCard';

/** Three-product showcase. */
export default function Showcase({ onQuickView }) {
  const { products } = useStore();
  if (!products.length) return null;

  return (
    <section className="section" id="shop">
      <div className="container">
        <div className="center" style={{ marginBottom: 26 }}>
          <div className="eyebrow">The Collection</div>
          <h2>Pick Your Kind Of Magic.</h2>
          <p style={{ maxWidth: 560, margin: '0 auto' }}>
            Three ways to bring the bubbles. Every one is built for gifting and everyday fun.
          </p>
        </div>
        <div className="grid grid--products">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} onQuickView={onQuickView} />
          ))}
        </div>
      </div>
    </section>
  );
}
