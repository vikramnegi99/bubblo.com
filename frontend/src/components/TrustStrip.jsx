export default function TrustStrip() {
  const items = [
    { icon: '💵', label: 'Cash on Delivery' },
    { icon: '🔒', label: 'Secure Checkout' },
    { icon: '📞', label: 'Order Confirmation' },
    { icon: '💬', label: 'Customer Support' },
  ];
  return (
    <section className="trust">
      <div className="container">
        <div className="trust__row">
          {items.map((i) => (
            <div className="trust__item" key={i.label}>
              <span aria-hidden="true" style={{ fontSize: '1.3rem' }}>{i.icon}</span>
              <span>{i.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
