import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { inr } from '../lib/format';

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.summary(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <div className="panel"><p className="err">{error}</p></div>;
  if (!data) return <p>Loading…</p>;

  const t = data.totals;

  return (
    <>
      <h2>Sales Summary</h2>
      <div className="grid grid--cards" style={{ marginBottom: 18 }}>
        <Stat label="Orders" value={t.orders} />
        <Stat label="Revenue (all)" value={inr(t.revenue)} />
        <Stat label="Paid revenue" value={inr(t.paidRevenue)} />
        <Stat label="Awaiting call" value={t.pendingCall} />
      </div>

      <div className="grid grid--2">
        <div className="panel">
          <h3>By status</h3>
          {data.byStatus.length === 0 ? <p className="muted">No orders yet.</p> : (
            <table className="admin">
              <thead><tr><th>Status</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.byStatus.map((r) => (
                  <tr key={r.status}><td>{r.status}</td><td>{r.count}</td><td>{inr(r.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="panel">
          <h3>By product</h3>
          {data.byProduct.length === 0 ? <p className="muted">No orders yet.</p> : (
            <table className="admin">
              <thead><tr><th>Product</th><th>Orders</th><th>Units</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.byProduct.map((r) => (
                  <tr key={r.slug}><td>{r.name}</td><td>{r.orders}</td><td>{r.units}</td><td>{inr(r.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Quick actions</h3>
        <div className="row-actions">
          <Link className="btn btn--primary btn--sm" to="/admin/orders">Manage orders</Link>
          <Link className="btn btn--ghost btn--sm" to="/admin/products">Edit products</Link>
          <Link className="btn btn--ghost btn--sm" to="/admin/campaign">Campaign</Link>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat__n">{value}</div>
      <div className="stat__l">{label}</div>
    </div>
  );
}
