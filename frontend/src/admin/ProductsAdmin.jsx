import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { inr } from '../lib/format';

export default function ProductsAdmin() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [assets, setAssets] = useState({});
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    const [p, a] = await Promise.all([adminApi.products(token), adminApi.productAssets(token)]);
    setProducts(p.products);
    const map = {};
    a.manifest.forEach((m) => { map[m.slug] = m; });
    setAssets(map);
  };

  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [token]);

  const save = async (draft) => {
    try {
      const patch = {
        name: draft.name,
        tag: draft.tag,
        shortDescription: draft.shortDescription,
        description: draft.description,
        price: Number(draft.price),
        mrp: Number(draft.mrp),
        discount: Number(draft.discount),
        visible: draft.visible,
        gallery: draft.gallery,
        benefits: draft.benefits,
        whatsIncluded: draft.whatsIncluded,
        howItWorks: draft.howItWorks,
        faqs: draft.faqs,
      };
      await adminApi.updateProduct(draft.slug, patch, token);
      setMessage(`${draft.name} saved.`);
      setEditing(null);
      load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <>
      <h2>Products</h2>
      <p className="muted" style={{ marginTop: -8 }}>
        Three products. Toggle visibility, edit pricing/MRP, reorder the Cloudinary gallery, and edit benefits &amp; FAQs.
        Discounts only show on the storefront when they are truthful (MRP &gt; price).
      </p>
      {message && <p className="hint">{message}</p>}

      <div className="grid grid--products">
        {products.map((p) => (
          <div className="card" key={p.slug} style={{ padding: 16 }}>
            <div style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
              {p.hero && <img src={p.hero.url} alt={p.name} loading="lazy" />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
              <strong>{p.name}</strong>
              <span className="pill">{p.visible ? 'Visible' : 'Hidden'}</span>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', margin: '6px 0' }}>
              {inr(p.price)}{p.showDiscount ? ` · MRP ${inr(p.mrp)} · ${p.discount}% OFF` : ''}
            </p>
            <button className="btn btn--primary btn--sm btn--block" onClick={() => setEditing({ ...p })}>Edit</button>
          </div>
        ))}
      </div>

      {editing && (
        <ProductEditor
          draft={editing}
          assets={assets[editing.slug]}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={() => save(editing)}
        />
      )}
    </>
  );
}

function ProductEditor({ draft, assets, onChange, onCancel, onSave }) {
  const set = (k, v) => onChange({ ...draft, [k]: v });

  const moveImage = (i, dir) => {
    const g = [...draft.gallery];
    const j = i + dir;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
    set('gallery', g.map((x) => x.publicId || x));
  };

  const addAsset = (publicId) => {
    const ids = draft.gallery.map((x) => x.publicId || x);
    if (ids.includes(publicId)) return;
    set('gallery', [...ids, publicId]);
  };

  const galleryIds = draft.gallery.map((x) => x.publicId || x);

  return (
    <div className="modal-wrap">
      <div className="overlay" onClick={onCancel} />
      <div className="modal" style={{ position: 'relative', zIndex: 2, padding: 22 }}>
        <h3>Edit: {draft.name}</h3>

        <div className="grid grid--2">
          <div className="field">
            <label>Name</label>
            <input className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Tag</label>
            <input className="input" value={draft.tag || ''} onChange={(e) => set('tag', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Short description</label>
          <input className="input" value={draft.shortDescription || ''} onChange={(e) => set('shortDescription', e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" rows="4" value={draft.description || ''} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="grid grid--2">
          <div className="field">
            <label>Price (₹)</label>
            <input className="input" type="number" value={draft.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div className="field">
            <label>MRP (₹)</label>
            <input className="input" type="number" value={draft.mrp} onChange={(e) => set('mrp', e.target.value)} />
          </div>
        </div>

        <div className="grid grid--2">
          <div className="field">
            <label>Discount (%) — shown only if truthful</label>
            <input className="input" type="number" min="0" max="100" value={draft.discount}
              onChange={(e) => set('discount', e.target.value)} />
          </div>
          <div className="field">
            <label>Visibility</label>
            <button type="button" className={`btn ${draft.visible ? 'btn--primary' : 'btn--ghost'} btn--block`}
              onClick={() => set('visible', !draft.visible)}>
              {draft.visible ? 'Visible on storefront' : 'Hidden from storefront'}
            </button>
          </div>
        </div>

        <h4 style={{ marginTop: 18 }}>Gallery order</h4>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {galleryIds.map((pid, i) => {
            const a = assets?.gallery?.find((g) => g.publicId === pid);
            return (
              <div key={pid} style={{ width: 96, textAlign: 'center' }}>
                <div style={{ height: 72, borderRadius: 10, overflow: 'hidden', background: 'var(--off-white)' }}>
                  {a && <img src={a.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
                  <button className="btn btn--sm btn--ghost" onClick={() => moveImage(i, -1)} aria-label="Move left">←</button>
                  <button className="btn btn--sm btn--ghost" onClick={() => moveImage(i, 1)} aria-label="Move right">→</button>
                </div>
              </div>
            );
          })}
        </div>
        {assets && (
          <p className="hint" style={{ marginTop: 8 }}>
            Available for this product:{' '}
            {assets.gallery.filter((g) => !galleryIds.includes(g.publicId)).map((g) => (
              <button key={g.publicId} className="btn btn--sm btn--soft" style={{ marginRight: 6 }} onClick={() => addAsset(g.publicId)}>
                + Add image
              </button>
            ))}
            {assets.gallery.every((g) => galleryIds.includes(g.publicId)) && 'All manifest images are in the gallery.'}
          </p>
        )}

        <h4 style={{ marginTop: 18 }}>Benefits</h4>
        {(draft.benefits || []).map((b, i) => (
          <div className="inline-form" key={i} style={{ marginBottom: 8 }}>
            <input className="input" style={{ maxWidth: 200 }} value={b.title}
              onChange={(e) => { const arr = [...draft.benefits]; arr[i] = { ...b, title: e.target.value }; set('benefits', arr); }} />
            <input className="input" style={{ flex: 1, minWidth: 200 }} value={b.text}
              onChange={(e) => { const arr = [...draft.benefits]; arr[i] = { ...b, text: e.target.value }; set('benefits', arr); }} />
            <button className="btn btn--sm btn--ghost" onClick={() => set('benefits', draft.benefits.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn btn--soft btn--sm" onClick={() => set('benefits', [...(draft.benefits || []), { title: '', text: '' }])}>+ Add benefit</button>

        <h4 style={{ marginTop: 18 }}>What&rsquo;s included</h4>
        {(draft.whatsIncluded || []).map((w, i) => (
          <div className="inline-form" key={i} style={{ marginBottom: 8 }}>
            <input className="input" style={{ flex: 1 }} value={w}
              onChange={(e) => { const arr = [...draft.whatsIncluded]; arr[i] = e.target.value; set('whatsIncluded', arr); }} />
            <button className="btn btn--sm btn--ghost" onClick={() => set('whatsIncluded', draft.whatsIncluded.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn btn--soft btn--sm" onClick={() => set('whatsIncluded', [...(draft.whatsIncluded || []), ''])}>+ Add item</button>

        <h4 style={{ marginTop: 18 }}>FAQs</h4>
        {(draft.faqs || []).map((f, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <input className="input" placeholder="Question" value={f.q}
              onChange={(e) => { const arr = [...draft.faqs]; arr[i] = { ...f, q: e.target.value }; set('faqs', arr); }} />
            <textarea className="textarea" rows="2" style={{ marginTop: 6 }} placeholder="Answer" value={f.a}
              onChange={(e) => { const arr = [...draft.faqs]; arr[i] = { ...f, a: e.target.value }; set('faqs', arr); }} />
            <button className="btn btn--sm btn--ghost" onClick={() => set('faqs', draft.faqs.filter((_, j) => j !== i))}>Remove FAQ</button>
          </div>
        ))}
        <button className="btn btn--soft btn--sm" onClick={() => set('faqs', [...(draft.faqs || []), { q: '', a: '' }])}>+ Add FAQ</button>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn btn--primary" onClick={onSave}>Save changes</button>
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
