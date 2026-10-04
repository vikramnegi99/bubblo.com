import { useStore } from '../context/StoreContext';
import { useSeo } from '../lib/seo';

export default function Policies() {
  const { settings } = useStore();
  const p = settings.policies || {};
  useSeo({ title: 'Policies | BUBBLO', canonical: '/policies' });

  const blocks = [
    ['Shipping', p.shipping],
    ['Returns', p.returns],
    ['Privacy', p.privacy],
    ['Terms', p.terms],
  ].filter(([, v]) => v);

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <h1>Policies</h1>
      <p className="muted">Everything you need to know about ordering from BUBBLO.</p>
      {blocks.map(([title, body]) => (
        <div className="panel" key={title}>
          <h3>{title}</h3>
          <p style={{ margin: 0 }}>{body}</p>
        </div>
      ))}
      <div className="panel">
        <h3>Order confirmation</h3>
        <p style={{ margin: 0 }}>
          There is no OTP. You place a Cash on Delivery order and we call you to confirm it before dispatch.
        </p>
      </div>
    </div>
  );
}
