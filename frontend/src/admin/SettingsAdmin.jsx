import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsAdmin() {
  const { token } = useAuth();
  const [s, setS] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    adminApi.settings(token).then((r) => setS(r.settings)).catch((e) => setMessage(e.message));
  }, [token]);

  if (!s) return <p>Loading…</p>;

  const set = (k, v) => setS({ ...s, [k]: v });
  const setPolicy = (k, v) => setS({ ...s, policies: { ...s.policies, [k]: v } });
  const setSocial = (k, v) => setS({ ...s, social: { ...s.social, [k]: v } });

  const save = async () => {
    try {
      const r = await adminApi.updateSettings({
        brand_name: s.brand_name,
        tagline: s.tagline,
        hero_headline: s.hero_headline,
        hero_subheadline: s.hero_subheadline,
        contact_phone: s.contact_phone,
        contact_email: s.contact_email,
        contact_address: s.contact_address,
        shipping_charge: Number(s.shipping_charge),
        free_shipping_threshold: Number(s.free_shipping_threshold),
        cod_enabled: s.cod_enabled,
        policies: s.policies,
        social: s.social,
      }, token);
      setS(r.settings);
      setMessage('Settings saved.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <>
      <h2>Settings</h2>
      {message && <p className="hint">{message}</p>}

      <div className="panel">
        <h3>Brand &amp; hero</h3>
        <div className="grid grid--2">
          <div className="field"><label>Brand name</label><input className="input" value={s.brand_name} onChange={(e) => set('brand_name', e.target.value)} /></div>
          <div className="field"><label>Tagline</label><input className="input" value={s.tagline} onChange={(e) => set('tagline', e.target.value)} /></div>
        </div>
        <div className="field"><label>Hero headline</label><input className="input" value={s.hero_headline} onChange={(e) => set('hero_headline', e.target.value)} /></div>
        <div className="field"><label>Hero subheadline</label><textarea className="textarea" rows="2" value={s.hero_subheadline} onChange={(e) => set('hero_subheadline', e.target.value)} /></div>
      </div>

      <div className="panel">
        <h3>Commerce</h3>
        <div className="grid grid--2">
          <div className="field"><label>Shipping charge (₹)</label><input className="input" type="number" value={s.shipping_charge} onChange={(e) => set('shipping_charge', e.target.value)} /></div>
          <div className="field"><label>Free shipping threshold (₹)</label><input className="input" type="number" value={s.free_shipping_threshold} onChange={(e) => set('free_shipping_threshold', e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Cash on Delivery</label>
          <button type="button" className={`btn ${s.cod_enabled ? 'btn--primary' : 'btn--ghost'}`} onClick={() => set('cod_enabled', !s.cod_enabled)}>
            {s.cod_enabled ? 'COD enabled' : 'COD disabled'}
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Contact</h3>
        <div className="grid grid--2">
          <div className="field"><label>Phone</label><input className="input" value={s.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} /></div>
          <div className="field"><label>Email</label><input className="input" value={s.contact_email} onChange={(e) => set('contact_email', e.target.value)} /></div>
        </div>
        <div className="field"><label>Address</label><input className="input" value={s.contact_address} onChange={(e) => set('contact_address', e.target.value)} /></div>
      </div>

      <div className="panel">
        <h3>Social links</h3>
        <div className="grid grid--2">
          {['instagram', 'facebook', 'youtube', 'whatsapp'].map((k) => (
            <div className="field" key={k}>
              <label style={{ textTransform: 'capitalize' }}>{k}</label>
              <input className="input" value={s.social?.[k] || ''} onChange={(e) => setSocial(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Policies</h3>
        {['shipping', 'returns', 'privacy', 'terms'].map((k) => (
          <div className="field" key={k}>
            <label style={{ textTransform: 'capitalize' }}>{k}</label>
            <textarea className="textarea" rows="3" value={s.policies?.[k] || ''} onChange={(e) => setPolicy(k, e.target.value)} />
          </div>
        ))}
      </div>

      <button className="btn btn--primary" onClick={save}>Save settings</button>
    </>
  );
}
