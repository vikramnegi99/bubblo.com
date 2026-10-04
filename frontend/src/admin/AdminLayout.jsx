import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  ['/admin', 'Dashboard', true],
  ['/admin/orders', 'Orders'],
  ['/admin/products', 'Products'],
  ['/admin/campaign', 'Campaign'],
  ['/admin/reviews', 'Reviews'],
  ['/admin/settings', 'Settings'],
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();

  return (
    <div className="admin">
      <div className="admin__top">
        <div className="container">
          <Link to="/admin" className="logo" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>BUBBLO</Link>
          <nav className="admin__nav" aria-label="Admin">
            {LINKS.map(([to, label, end]) => (
              <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>{admin?.email}</span>
            <button className="btn btn--soft btn--sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>
      <div className="admin__body">
        <div className="container">{children}</div>
      </div>
    </div>
  );
}
