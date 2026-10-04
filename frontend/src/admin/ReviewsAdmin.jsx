import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';

export default function ReviewsAdmin() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    const params = filter === '' ? {} : { approved: filter };
    const r = await adminApi.reviews(params, token);
    setReviews(r.reviews);
  }, [filter, token]);

  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [load]);

  const act = async (fn, ok) => {
    try { await fn(); setMessage(ok); load(); } catch (e) { setMessage(e.message); }
  };

  return (
    <>
      <h2>Reviews</h2>
      <p className="muted" style={{ marginTop: -8 }}>
        Reviews submitted by customers stay pending until you approve them. Nothing is ever auto-published or faked.
      </p>
      {message && <p className="hint">{message}</p>}

      <div className="panel">
        <div className="inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="f">Show</label>
            <select id="f" className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="0">Pending</option>
              <option value="1">Approved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        {reviews.length === 0 ? (
          <div className="empty"><p style={{ margin: 0 }}>No reviews yet.</p></div>
        ) : (
          <table className="admin">
            <thead><tr><th>Product</th><th>Name</th><th>Rating</th><th>Review</th><th>Status</th><th>When</th><th /></tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.product_slug}</td>
                  <td>{r.customer_name}</td>
                  <td>{'★'.repeat(r.rating)}</td>
                  <td style={{ maxWidth: 320 }}>
                    {r.title && <strong>{r.title}<br /></strong>}{r.body}
                  </td>
                  <td><span className="pill">{r.approved ? 'Approved' : 'Pending'}</span></td>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      {r.approved ? (
                        <button className="btn btn--ghost btn--sm" onClick={() => act(() => adminApi.approveReview(r.id, false, token), 'Review unpublished.')}>Unapprove</button>
                      ) : (
                        <button className="btn btn--primary btn--sm" onClick={() => act(() => adminApi.approveReview(r.id, true, token), 'Review approved.')}>Approve</button>
                      )}
                      <button className="btn btn--ghost btn--sm" onClick={() => act(() => adminApi.deleteReview(r.id, token), 'Review deleted.')}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
