import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inr } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

/** Quick-view modal: large image, thumbnails, price, quantity, Buy Now / Add to Cart. */
export default function QuickView({ product, onClose }) {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;
  const gallery = product.gallery?.length ? product.gallery : product.hero ? [product.hero] : [];
  const current = gallery[active] || product.hero;

  const buyNow = () => {
    add(product, qty);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="overlay" onClick={onClose} />
      <div className="modal" style={{ position: 'relative', zIndex: 2, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="grid grid--2" style={{ alignItems: 'start' }}>
          <div>
            <div className="gallery__main">
              {current && <img src={current.url} srcSet={current.srcset} sizes="(max-width: 820px) 90vw, 420px" alt={product.name} loading="lazy" />}
            </div>
            <div className="gallery__rail">
              {gallery.map((g, i) => (
                <button key={i} className={`gallery__thumb ${i === active ? 'gallery__thumb--active' : ''}`} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}>
                  <img src={g.thumb || g.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div>
            {product.tag && <span className="chip">{product.tag}</span>}
            <h3 style={{ marginTop: 10 }}>{product.name}</h3>
            <p className="muted">{product.shortDescription}</p>
            <div className="pcard__price">
              <span className="price-now">{inr(product.price)}</span>
              {product.showDiscount && (
                <>
                  <span className="price-mrp">{inr(product.mrp)}</span>
                  <span className="chip chip--discount">{product.discount}% OFF</span>
                </>
              )}
            </div>

            <div className="qty" style={{ margin: '16px 0' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <button className="btn btn--primary btn--block" onClick={buyNow}>Buy Now</button>
              <button className="btn btn--ghost btn--block" onClick={() => { add(product, qty); toast(`${product.name} added to cart`); }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
