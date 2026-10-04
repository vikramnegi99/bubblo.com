import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { inr, formatDate } from '../lib/format';

export default function OrdersAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.orders({ search, status }, token);
      setOrders(r.orders);
      setStatuses(r.statuses);
    } finally {
      setLoading(false);
    }
  }, [search, status, token]);

  useEffect(() => { load(); }, [load]);

  const change = async (orderId, next) => {
    try {
      const r = await adminApi.setOrderStatus(orderId, next, '', token);
      setMessage(`${orderId} → ${r.order.orderStatus}${next === 'Delivered' ? ' (payment marked Paid)' : ''}`);
      load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <>
      <h2>Orders</h2>
      <p className="muted" style={{ marginTop: -8 }}>
        Every COD order is confirmed manually. Use <strong>Call Customer</strong> to ring them from your
        phone, or <strong>WhatsApp Customer</strong> to send a pre-filled confirmation message.
      </p>

      <div className="panel">
        <div className="inline-form">
          <div className="field" style={{ margin: 0, minWidth: 220 }}>
            <label htmlFor="search">Search</label>
            <input id="search" className="input" placeholder="Order ID, name, phone, city…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="status">Status</label>
            <select id="status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn--primary btn--sm" onClick={load}>Refresh</button>
        </div>
        {message && <p className="hint" style={{ marginTop: 10 }}>{message}</p>}
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        {loading ? <p>Loading…</p> : orders.length === 0 ? (
          <div className="empty"><p style={{ margin: 0 }}>No orders found.</p></div>
        ) : (
          <table className="admin">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Actions</th><th>Address</th>
                <th>Product</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId}>
                  <td><strong>{o.orderId}</strong></td>
                  <td>{o.customerName}<br /><span className="muted">{o.phoneDisplay}</span></td>
                  <td>
                    <div className="row-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                      <a
                        className="btn btn--soft btn--sm"
                        href={o.callLink}
                        aria-label={`Call ${o.customerName}`}
                      >
                        📞 Call Customer
                      </a>
                      <a
                        className="btn btn--soft btn--sm"
                        href={o.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${o.customerName}`}
                      >
                        💬 WhatsApp Customer
                      </a>
                    </div>
                  </td>
                  <td style={{ maxWidth: 240 }}>
                    {o.address.house}, {o.address.street}
                    {o.address.landmark ? `, ${o.address.landmark}` : ''}<br />
                    {o.address.city} {o.address.pincode}, {o.address.state}
                    <br /><span className="pill">{o.address.type}</span>
                  </td>
                  <td>{o.productName}<br /><span className="muted">× {o.quantity}</span></td>
                  <td>{inr(o.total)}</td>
                  <td><span className="pill">{o.paymentMethod} · {o.paymentStatus}</span></td>
                  <td>
                    <select className="select" value={o.orderStatus} onChange={(e) => change(o.orderId, e.target.value)}>
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
