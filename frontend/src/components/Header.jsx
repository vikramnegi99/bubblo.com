import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { count, setDrawerOpen } = useCart();
  const { settings } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo" onClick={close} aria-label="BUBBLO home">
          <img className="logo__img" src="https://res.cloudinary.com/acqrwkcn/image/upload/f_auto,q_auto,w_160/file_00000000cabc8211b5b2897d5d1fd80b.png" alt="BUBBLO" width="42" height="42" />
        </Link>

        <nav className="header__nav" aria-label="Primary">
          <Link to="/#shop">Shop</Link>
          <Link to="/#why">Why Bubblo</Link>
          <Link to="/#gifting">Gifting</Link>
          <Link to="/#faq">FAQ</Link>
          <Link to="/track">Track Order</Link>
        </nav>

        <div className="header__actions">
          <button
            className="icon-btn hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <button className="icon-btn" aria-label="Open cart" onClick={() => setDrawerOpen(true)}>
            🛍
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile">
          <Link to="/#shop" onClick={close}>Shop</Link>
          <Link to="/#why" onClick={close}>Why Bubblo</Link>
          <Link to="/#gifting" onClick={close}>Gifting</Link>
          <Link to="/#faq" onClick={close}>FAQ</Link>
          <Link to="/track" onClick={close}>Track Order</Link>
          <Link to="/cart" onClick={close}>Cart ({count})</Link>
        </nav>
      )}
      {/* keep location in deps-free close on route change */}
      <span hidden>{location.pathname}</span>
    </header>
  );
}
