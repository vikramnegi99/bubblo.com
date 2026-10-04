import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { inr, formatPhoneDisplay } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useSeo } from '../lib/seo';
import Bubbles from '../components/Bubbles';

export default function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clear } = useCart();
  const order = state?.order;

  useSeo({ title: 'Order Confirmed | BUBBLO', canonical: '/order-confirmed' });

  useEffect(() => {
    if (order) clear();
  }, [order, clear]);

  if (!order) {
    return (
      <div className="container section center">
        <h2>No order to show</h2>
        <p className="muted">Place an order to see your confirmation here.</p>
        <Link to="/#shop" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  return (
    <section className="hero" style={{ background: 'var(--grad-soft)' }}>
      <Bubbles count={6} />
      <div className="container section" style={{ position: 'relative', zIndex: 2 }}>
        <div className="card" style={{ maxWidth: 620, margin: '0 auto', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem' }} aria-hidden="true">🎉</div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.2rem)' }}>Order Placed Successfully</h1>
          <p style={{ marginBottom: 6 }}>Thank you for your order.</p>
          <p className="muted" style={{ fontWeight: 600 }}>
            We&rsquo;ll contact you shortly to confirm your COD order.
          </p>

          <div className="panel" style={{ textAlign: 'left', marginTop: 22 }}>
            <Row label="Order ID" value={<strong>{order.orderId}</strong>} />
            <Row label="Product" value={`${order.productName} × ${order.quantity}`} />
            <Row label="Payment" value="Cash on Delivery" />
            <Row label="Total" value={<strong>{inr(order.total)}</strong>} />
            <Row label="Mobile" value={formatPhoneDisplay(order.phone)} />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
            <button className="btn btn--primary" onClick={() => navigate('/track', { state: { orderId: order.orderId } })}>
              TRACK MY ORDER
            </button>
            <Link to="/#shop" className="btn btn--ghost">BACK TO SHOP</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="muted">{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}
