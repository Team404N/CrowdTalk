// 404 page
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="card auth-card center-text">
        <h1>404</h1>
        <p>We couldn't find that page.</p>
        <Link className="btn" to="/home">Back to Home</Link>
      </div>
    </div>
  );
}
