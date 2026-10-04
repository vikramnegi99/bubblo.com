import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function CampaignAdmin() {
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [publicView, setPublicView] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState(null);

  const load = async () => {
    const [c, p] = await Promise.all([adminApi.campaign(token), adminApi.products(token)]);
    setForm({
      name: c.campaign?.name || '',
      headline: c.campaign?.headline || '',
      description: c.campaign?.description || '',
      accent: c.campaign?.accent || '#c026d3',
      startDate: c.campaign?.start_date || '',
      endDate: c.campaign?.end_date || '',
      active: !!c.campaign?.active,
      products: c.campaign?.products || [],
    });
    setPublicView(c.public);
    setProducts(p.products);
  };

  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [token]);

  if (!form) return <p>Loading…</p>;

  const set = (k, v) => setForm({ ...form, [k]: v });
  const toggleProduct = (slug) => {
    const has = form.products.includes(slug);
    set('products', has ? form.products.filter((s) => s !== slug) : [...form.products, slug]);
  };

  const save = async () => {
    try {
      const r = await adminApi.updateCampaign({
        name: form.name || null,
        headline: form.headline || null,
        description: form.description || null,
        accent: form.accent || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        active: form.active,
        products: form.products,
      }, token);
      setPublicView(r.public);
      setMessage('Campaign saved.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <>
      <h2>Campaign</h2>
      <p className="muted" style={{ marginTop: -8 }}>
        The sale banner and countdown appear on the storefront only when the campaign is <strong>active</strong> and has a
        real end date in the future. No end date ⇒ no countdown. We never fake a timer.
      </p>
      {message && <p className="hint">{message}</p>}

      <div className="panel">
        <div className="grid grid--2">
          <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="field"><label>Headline</label><input className="input" value={form.headline} onChange={(e) => set('headline', e.target.value)} /></div>
        </div>
        <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div className="grid grid--2">
          <div className="field"><label>Start date</label><input className="input" type="datetime-local" value={form.startDate || ''} onChange={(e) => set('startDate', e.target.value)} /></div>
          <div className="field"><label>End date (required for a countdown)</label><input className="input" type="datetime-local" value={form.endDate || ''} onChange={(e) => set('endDate', e.target.value)} /></div>
        </div>
        <div className="grid grid--2">
          <div className="field"><label>Accent colour</label><input className="input" value={form.accent} onChange={(e) => set('accent', e.target.value)} /></div>
          <div className="field">
            <label>Active</label>
            <button type="button" className={`btn ${form.active ? 'btn--primary' : 'btn--ghost'} btn--block`} onClick={() => set('active', !form.active)}>
              {form.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
        <div className="field">
          <label>Products included</label>
          <div className="row-actions">
            {products.map((p) => (
              <button key={p.slug} type="button" className={`radio-pill ${form.products.includes(p.slug) ? 'radio-pill--active' : ''}`}
                onClick={() => toggleProduct(p.slug)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn--primary" onClick={save}>Save campaign</button>
      </div>

      <div className="panel">
        <h3>Storefront view (computed)</h3>
        <p className="muted" style={{ marginTop: -6 }}>
          This is exactly what the API returns to the storefront right now.
        </p>
        <pre style={{ background: 'var(--off-white)', padding: 14, borderRadius: 12, overflow: 'auto', fontSize: '0.82rem' }}>
          {JSON.stringify(publicView, null, 2)}
        </pre>
        {!publicView?.active && <p className="hint">Campaign is inactive — the storefront shows no banner and no countdown.</p>}
      </div>
    </>
  );
}
