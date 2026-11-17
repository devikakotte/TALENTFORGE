import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { ROUTES } from '../constants';

/**
 * Wraps protected route branches. Waits for the initial silent-refresh
 * check before deciding, so an authenticated user with a valid refresh
 * cookie isn't briefly bounced to /login on page reload.
 *
 * `allowedRoles`, when provided, further restricts access by role
 * (used starting Phase 7 for role-specific dashboards).
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
