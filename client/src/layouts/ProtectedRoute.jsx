import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Redirects to '/' if user is not logged in.
 */
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

/**
 * AdminRoute — Redirects to '/dashboard' if user is not an admin.
 */
export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
