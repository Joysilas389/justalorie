import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: '5rem' }}>🍽️</div>
      <h2 className="fw-bold mt-3">404 — Page Not Found</h2>
      <p className="text-body-secondary mb-4">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-success">
        <i className="bi bi-house me-1"></i>Go to Dashboard
      </Link>
    </div>
  );
}
