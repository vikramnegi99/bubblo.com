import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  const year = new Date().getFullYear();
  const social = settings.social || {};
  const socialLinks = Object.entries(social).filter(([, v]) => v);

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="logo" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>BUBBLO</div>
            <p style={{ color: '#f6e9f4', opacity: 0.85, maxWidth: 320 }}>
              {settings.tagline} Bubble wands, bubble guns and glow — made for gifting and everyday magic.
            </p>
            <p style={{ color: '#f6e9f4', opacity: 0.7, fontSize: '0.85rem' }}>
              Cash on Delivery available. Every COD order is confirmed by a quick phone call.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/#shop">All Products</Link></li>
              <li><Link to="/#gifting">Gifting</Link></li>
              <li><Link to="/track">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4>Help</h4>
            <ul>
              <li><Link to="/#faq">FAQ</Link></li>
              <li><Link to="/policies">Shipping &amp; Returns</Link></li>
              <li><Link to="/policies">Privacy &amp; Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              {settings.contact?.phone && <li><a href={`tel:${settings.contact.phone.replace(/\s/g, '')}`}>{settings.contact.phone}</a></li>}
              {settings.contact?.email && <li><a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a></li>}
              {settings.contact?.address && <li>{settings.contact.address}</li>}
              {socialLinks.map(([k, v]) => (
                <li key={k}><a href={v} target="_blank" rel="noopener noreferrer">{k[0].toUpperCase() + k.slice(1)}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} BUBBLO. All rights reserved.</span>
          <span>Made in India · Prices in ₹ (INR)</span>
        </div>
      </div>
    </footer>
  );
}
