import { Link } from 'react-router-dom';
import { inr } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

/** Product card with an image, price, truthful discount badge and a quick-view. */
export default function ProductCard({ product, onQuickView }) {
  const { add } = useCart();
  const toast = useToast();

  return (
    <article className="pcard">
      <div className="pcard__media">
        {product.showDiscount && (
          <span className="chip chip--discount pcard__badge">{product.discount}% OFF</span>
        )}
        <Link to={`/products/${product.slug}`} aria-label={product.name}>
          {product.hero && (
            <img
              src={product.hero.url}
              srcSet={product.hero.srcset}
              sizes="(max-width: 820px) 100vw, 380px"
              alt={product.name}
              loading="lazy"
              width="800"
              height="800"
            />
          )}
        </Link>
        {onQuickView && (
          <button className="btn btn--soft btn--sm pcard__quick" onClick={() => onQuickView(product)}>
            Quick view
          </button>
        )}
      </div>

      <div className="pcard__body">
        {product.tag && <span className="chip">{product.tag}</span>}
        <Link to={`/products/${product.slug}`} className="pcard__name">{product.name}</Link>
        <p className="muted" style={{ fontSize: '0.86rem', margin: 0 }}>{product.shortDescription}</p>

        <div className="pcard__price">
          <span className="price-now">{inr(product.price)}</span>
          {product.showDiscount && <span className="price-mrp">{inr(product.mrp)}</span>}
        </div>

        <div className="pcard__actions">
          <Link className="btn btn--ghost btn--sm" style={{ flex: 1 }} to={`/products/${product.slug}`}>
            View
          </Link>
          <button
            className="btn btn--primary btn--sm"
            style={{ flex: 1 }}
            onClick={() => { add(product, 1); toast(`${product.name} added to cart`); }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
