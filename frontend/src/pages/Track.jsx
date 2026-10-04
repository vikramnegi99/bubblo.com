import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { storeApi } from '../lib/api';
import { inr, validateMobile, digitsOnly } from '../lib/format';
import { useSeo } from '../lib/seo';

export default function Track() {
  const { state } = useLocation();
  const [orderId, setOrderId] = useState(state?.orderId || '');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useSeo({ title: 'Track Your Order | BUBBLO', canonical: '/track' });

  const submit = async (e) => {
    e.preventDefault();
    const m = validateMobile(phone);
    if (!m.ok) { setError(m.message); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await storeApi.track({ orderId, phone });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <div className="center" style={{ marginBottom: 20 }}>
        <div className="eyebrow">Order Tracking</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.2rem)' }}>Track Your Order</h1>
        <p className="muted">Enter your Order ID and the mobile number you ordered with.</p>
      </div>

      <form className="panel" onSubmit={submit}>
        <div className="field">
          <label htmlFor="orderId">Order ID <span className="req">*</span></label>
          <input id="orderId" className="input" placeholder="BB-XXXXXX" value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())} required />
        </div>
        <div className="field">
          <label htmlFor="tphone">Mobile Number <span className="req">*</span></label>
          <div className="phone-field">
            <span className="phone-field__prefix" aria-hidden="true">+91</span>
            <input id="tphone" type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
              value={phone} onChange={(e) => setPhone(digitsOnly(e.target.value, 10))} />
          </div>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Checking…' : 'TRACK MY ORDER'}
        </button>
      </form>

      {result && (
        <div className="panel" style={{ marginTop: 18 }}>
          <h3>{result.order.orderId}</h3>
          <p className="muted" style={{ marginTop: -6 }}>
            {result.order.productName} × {result.order.quantity} · {inr(result.order.total)} · {result.order.paymentMethod}
          </p>

          {result.cancelled ? (
            <p className="err">This order has been cancelled. Please contact support if this looks wrong.</p>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: '18px 0 0' }}>
              {result.steps.map((s) => (
                <li key={s.status} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
                      background: s.reached ? 'var(--grad-brand)' : '#eee',
                      color: s.reached ? '#fff' : 'var(--ink-soft)', fontWeight: 800, fontSize: '0.75rem',
                    }}
                  >
                    {s.reached ? '✓' : ''}
                  </span>
                  <span style={{ fontWeight: s.reached ? 700 : 500, color: s.reached ? 'var(--ink)' : 'var(--ink-soft)' }}>
                    {s.status}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <p className="hint" style={{ marginTop: 14 }}>
            Current status: <strong>{result.order.orderStatus}</strong> · Payment: {result.order.paymentStatus}
          </p>
        </div>
      )}

      <p className="center" style={{ marginTop: 18 }}>
        <Link to="/#shop" className="btn btn--ghost btn--sm">Back to shop</Link>
      </p>
    </div>
  );
}
