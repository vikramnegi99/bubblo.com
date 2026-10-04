import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export default function NotFound() {
  useSeo({ title: 'Page not found | BUBBLO' });
  return (
    <div className="container section center">
      <h1>404</h1>
      <p className="muted">We couldn&rsquo;t find that page.</p>
      <Link to="/" className="btn btn--primary">Back home</Link>
    </div>
  );
}
