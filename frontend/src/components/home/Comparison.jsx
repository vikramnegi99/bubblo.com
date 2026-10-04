import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { inr } from '../../lib/format';

/** "Which One Fits Your Vibe?" — compares only real, admin-controlled facts. */
export default function Comparison() {
  const { products } = useStore();
  if (products.length < 2) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="center" style={{ marginBottom: 24 }}>
          <div className="eyebrow">Compare</div>
          <h2>Which One Fits Your Vibe?</h2>
        </div>
        <div className="table-wrap">
          <table className="cmp">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Discount</th>
                <th>The Vibe</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug}>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>
                    {inr(p.price)}
                    {p.showDiscount && <span className="price-mrp" style={{ marginLeft: 8 }}>{inr(p.mrp)}</span>}
                  </td>
                  <td>{p.showDiscount ? `${p.discount}% OFF` : '—'}</td>
                  <td>{p.tag || '—'}</td>
                  <td><Link className="btn btn--ghost btn--sm" to={`/products/${p.slug}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
