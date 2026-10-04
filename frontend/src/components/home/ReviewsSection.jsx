import { useState } from 'react';
import { api } from '../../lib/api';

function Stars({ value = 0 }) {
  return (
    <span aria-label={`${value} out of 5 stars`} style={{ color: '#f59e0b', letterSpacing: 2 }}>
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

/**
 * Social proof. Shows only real, approved reviews. When there are none it
 * shows an honest empty state — we never fabricate reviews.
 */
export default function ReviewsSection({ productSlug, reviews = [], summary, onSubmitted }) {
  const [form, setForm] = useState({ customerName: '', rating: 5, title: '', body: '' });
  const [state, setState] = useState({ submitting: false, done: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ submitting: true, done: false, error: null });
    try {
      await api.post('/api/reviews', { productSlug, ...form });
      setState({ submitting: false, done: true, error: null });
      setForm({ customerName: '', rating: 5, title: '', body: '' });
      onSubmitted?.();
    } catch (err) {
      setState({ submitting: false, done: false, error: err.message });
    }
  };

  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="center" style={{ marginBottom: 20 }}>
          <div className="eyebrow">Real Reactions</div>
          <h2>What People Say</h2>
          {summary && summary.count > 0 && (
            <p className="muted"><Stars value={summary.average} /> {summary.average} · {summary.count} review{summary.count > 1 ? 's' : ''}</p>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '1.6rem' }} aria-hidden="true">💬</div>
            <p style={{ margin: '8px 0 0', fontWeight: 600, color: 'var(--ink)' }}>Your review could be the first.</p>
            <p className="muted" style={{ margin: '4px 0 0' }}>Be the first to share how it went.</p>
          </div>
        ) : (
          <div className="grid grid--products">
            {reviews.map((r) => (
              <div className="card" key={r.id} style={{ padding: 18 }}>
                <Stars value={r.rating} />
                {r.title && <h3 style={{ fontSize: '1rem', margin: '8px 0 4px' }}>{r.title}</h3>}
                <p style={{ margin: 0 }}>{r.body}</p>
                <p className="muted" style={{ margin: '10px 0 0', fontSize: '0.82rem' }}>— {r.customerName}</p>
              </div>
            ))}
          </div>
        )}

        {productSlug && (
          <form className="panel" style={{ maxWidth: 560, margin: '26px auto 0' }} onSubmit={submit}>
            <h3 style={{ fontSize: '1.05rem' }}>Leave a review</h3>
            {state.done && <p style={{ color: 'var(--magenta)', fontWeight: 600 }}>Thank you! Your review will appear once it is approved.</p>}
            {state.error && <p className="err">{state.error}</p>}
            <div className="field">
              <label htmlFor="rv-name">Your name <span className="req">*</span></label>
              <input id="rv-name" className="input" required value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="rv-rating">Rating</label>
              <select id="rv-rating" className="select" value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="rv-body">Your review <span className="req">*</span></label>
              <textarea id="rv-body" className="textarea" rows="4" required value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <button className="btn btn--primary" disabled={state.submitting}>
              {state.submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export { Stars };
