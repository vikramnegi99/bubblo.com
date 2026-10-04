import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { inr } from '../lib/format';

export default function CartDrawer() {
  const { items, updateQty, remove, totals, drawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  if (!drawerOpen) return null;
  const item = items[0];

  const checkout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="overlay" onClick={() => setDrawerOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer__head">
          <strong>Your Cart</strong>
          <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close cart">✕</button>
        </div>

        <div className="drawer__body">
          {!item ? (
            <div className="empty">
              <p style={{ margin: 0 }}>Your cart is empty.</p>
              <button className="btn btn--soft btn--sm" style={{ marginTop: 12 }} onClick={() => { setDrawerOpen(false); navigate('/#shop'); }}>
                Start shopping
              </button>
            </div>
          ) : (
            <div className="cart-line">
              <img src={item.image} alt={item.name} loading="lazy" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.name}</div>
                <div className="pcard__price" style={{ marginTop: 4 }}>
                  <span className="price-now" style={{ fontSize: '1rem' }}>{inr(item.price)}</span>
                  {item.showDiscount && <span className="price-mrp">{inr(item.mrp)}</span>}
                </div>
                <div className="qty" style={{ marginTop: 8 }}>
                  <button onClick={() => updateQty(item.slug, item.quantity - 1)} aria-label="Decrease">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.slug, item.quantity + 1)} aria-label="Increase">+</button>
                </div>
              </div>
              <button className="btn btn--sm" style={{ background: 'none', border: 'none', color: 'var(--magenta)' }} onClick={() => remove(item.slug)}>
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="drawer__foot">
          {item && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
                <span className="muted">Subtotal</span><span>{inr(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6, color: 'var(--magenta)' }}>
                  <span>Discount</span><span>−{inr(totals.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, margin: '10px 0 14px' }}>
                <span>Total</span><span>{inr(totals.payTotal)}</span>
              </div>
              <button className="btn btn--primary btn--block" onClick={checkout}>CHECKOUT</button>
              <p className="hint center" style={{ marginTop: 10 }}>
                Cash on Delivery · confirmed by a quick phone call
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
