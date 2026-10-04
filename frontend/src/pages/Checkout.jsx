import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { storeApi } from '../lib/api';
import { inr, validateMobile, validatePincode, digitsOnly } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useSeo } from '../lib/seo';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { items } = useCart();
  const { products, settings } = useStore();

  useSeo({ title: 'Checkout | BUBBLO', canonical: '/checkout' });

  // Buy-now (?slug=&qty=) takes precedence over the cart line.
  const directSlug = params.get('slug');
  const directQty = Number(params.get('qty')) || 1;
  const product = useMemo(() => {
    if (directSlug) return products.find((p) => p.slug === directSlug) || null;
    const line = items[0];
    return line ? products.find((p) => p.slug === line.slug) || null : null;
  }, [directSlug, products, items]);

  const quantity = directSlug ? directQty : items[0]?.quantity || 1;

  const [form, setForm] = useState({
    customerName: '', phone: '', email: '', house: '', street: '', landmark: '',
    pincode: '', city: '', state: '', addressType: 'Home',
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [serverFields, setServerFields] = useState({});

  const errors = useMemo(() => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Please enter your full name.';
    const m = validateMobile(form.phone);
    if (!m.ok) e.phone = m.message;
    if (!form.house.trim()) e.house = 'Please enter your house / flat number.';
    if (!form.street.trim()) e.street = 'Please enter your street / area.';
    const p = validatePincode(form.pincode);
    if (!p.ok) e.pincode = p.message;
    if (!form.city.trim()) e.city = 'Please enter your city.';
    if (!form.state.trim()) e.state = 'Please enter your state.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const hasProduct = !!product;

  const prices = useMemo(() => {
    if (!product) return { subtotal: 0, discount: 0, shipping: 0, total: 0 };
    const subtotal = (product.mrp || product.price) * quantity;
    const discount = Math.max(0, (product.mrp || product.price) - product.price) * quantity;
    const shipping = Number(settings.shippingCharge) || 0;
    return { subtotal, discount, shipping, total: subtotal - discount + shipping };
  }, [product, quantity, settings.shippingCharge]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));
  const showErr = (key) => (touched[key] || serverFields[key]) && (errors[key] || serverFields[key]);

  const submit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    if (!isValid || !hasProduct) return;
    setSubmitting(true);
    setServerError(null);
    setServerFields({});
    try {
      const payload = { ...form, phone: form.phone, productSlug: product.slug, quantity, paymentMethod: 'COD' };
      const res = await storeApi.createOrder(payload);
      navigate('/order-confirmed', { state: { order: res.order } });
    } catch (err) {
      setServerError(err.message);
      setServerFields(err.fields || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasProduct) {
    return (
      <div className="container section center">
        <h2>Your cart is empty</h2>
        <p className="muted">Add a product to continue to checkout.</p>
        <Link to="/#shop" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.2rem)' }}>Checkout</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Cash on Delivery. No OTP — we&rsquo;ll call you shortly to confirm your order.
      </p>

      <div className="grid grid--2" style={{ alignItems: 'start', marginTop: 18 }}>
        {/* Form */}
        <form className="panel" onSubmit={submit} noValidate>
          {serverError && <p className="err" role="alert">{serverError}</p>}

          <div className="field">
            <label htmlFor="customerName">Full Name <span className="req">*</span></label>
            <input id="customerName" className={`input ${showErr('customerName') ? 'input--error' : ''}`}
              value={form.customerName} onChange={set('customerName')} onBlur={blur('customerName')} autoComplete="name" />
            {showErr('customerName') && <div className="err">{errors.customerName || serverFields.customerName}</div>}
          </div>

          <div className="field">
            <label htmlFor="phone">Mobile Number <span className="req">*</span></label>
            <div className={`phone-field ${showErr('phone') ? 'phone-field--error' : ''}`}>
              <span className="phone-field__prefix" aria-hidden="true">+91</span>
              <input id="phone" type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: digitsOnly(e.target.value, 10) }))}
                onBlur={blur('phone')} autoComplete="tel-national" />
            </div>
            {showErr('phone')
              ? <div className="err">{errors.phone || serverFields.phone}</div>
              : <div className="hint">Enter the 10-digit number only.</div>}
          </div>

          <div className="field">
            <label htmlFor="house">House / Flat <span className="req">*</span></label>
            <input id="house" className={`input ${showErr('house') ? 'input--error' : ''}`}
              value={form.house} onChange={set('house')} onBlur={blur('house')} autoComplete="address-line1" />
            {showErr('house') && <div className="err">{errors.house}</div>}
          </div>

          <div className="field">
            <label htmlFor="street">Street / Area <span className="req">*</span></label>
            <input id="street" className={`input ${showErr('street') ? 'input--error' : ''}`}
              value={form.street} onChange={set('street')} onBlur={blur('street')} autoComplete="address-line2" />
            {showErr('street') && <div className="err">{errors.street}</div>}
          </div>

          <div className="field">
            <label htmlFor="landmark">Landmark (optional)</label>
            <input id="landmark" className="input" value={form.landmark} onChange={set('landmark')} />
          </div>

          <div className="field">
            <label htmlFor="pincode">Pincode <span className="req">*</span></label>
            <input id="pincode" className={`input ${showErr('pincode') ? 'input--error' : ''}`} inputMode="numeric" maxLength={6}
              value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: digitsOnly(e.target.value, 6) }))}
              onBlur={blur('pincode')} autoComplete="postal-code" />
            {showErr('pincode') && <div className="err">{errors.pincode}</div>}
          </div>

          <div className="grid grid--2" style={{ gap: 14 }}>
            <div className="field">
              <label htmlFor="city">City <span className="req">*</span></label>
              <input id="city" className={`input ${showErr('city') ? 'input--error' : ''}`}
                value={form.city} onChange={set('city')} onBlur={blur('city')} autoComplete="address-level2" />
              {showErr('city') && <div className="err">{errors.city}</div>}
            </div>
            <div className="field">
              <label htmlFor="state">State <span className="req">*</span></label>
              <select id="state" className={`select ${showErr('state') ? 'input--error' : ''}`}
                value={form.state} onChange={set('state')} onBlur={blur('state')}>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {showErr('state') && <div className="err">{errors.state}</div>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email (optional)</label>
            <input id="email" className={`input ${showErr('email') ? 'input--error' : ''}`} type="email"
              value={form.email} onChange={set('email')} onBlur={blur('email')} autoComplete="email" />
            {showErr('email') && <div className="err">{errors.email}</div>}
          </div>

          <div className="field">
            <label>Address Type</label>
            <div className="radio-row">
              {ADDRESS_TYPES.map((t) => (
                <button type="button" key={t}
                  className={`radio-pill ${form.addressType === t ? 'radio-pill--active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, addressType: t }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={!isValid || submitting}>
            {submitting ? 'Placing order…' : 'PLACE COD ORDER'}
          </button>
          {!isValid && <p className="hint center">Fill in all required fields to enable the button.</p>}
        </form>

        {/* Summary */}
        <aside className="panel">
          <h3>Order Summary</h3>
          <div className="cart-line" style={{ gridTemplateColumns: '74px 1fr' }}>
            {product.hero && <img src={product.hero.thumb || product.hero.url} alt={product.name} loading="lazy" />}
            <div>
              <div style={{ fontWeight: 700 }}>{product.name}</div>
              <div className="muted" style={{ fontSize: '0.85rem' }}>Qty: {quantity}</div>
              <div className="pcard__price" style={{ marginTop: 4 }}>
                <span className="price-now" style={{ fontSize: '1rem' }}>{inr(product.price)}</span>
                {product.showDiscount && <span className="price-mrp">{inr(product.mrp)}</span>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: '0.92rem' }}>
            <Row label="Subtotal" value={inr(prices.subtotal)} />
            {prices.discount > 0 && <Row label="Discount" value={`−${inr(prices.discount)}`} accent />}
            <Row label="Shipping" value={prices.shipping ? inr(prices.shipping) : 'Free'} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: 10, fontSize: '1.1rem' }}>
              <span>Total</span><span>{inr(prices.total)}</span>
            </div>
          </div>

          <p className="hint" style={{ marginTop: 14 }}>
            Payment method: <strong>Cash on Delivery</strong>. We&rsquo;ll contact you shortly to confirm your COD order.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: accent ? 'var(--magenta)' : undefined }}>
      <span className="muted">{label}</span><span>{value}</span>
    </div>
  );
}
