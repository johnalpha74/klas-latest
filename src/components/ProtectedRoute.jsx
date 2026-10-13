import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useProfile, dashboardPath } from '@/hooks/useProfile';

function Loading() {
  return <div role="status" className="container py-24 text-muted-foreground">Loading…</div>;
}

/**
 * Signed-in only. Without a profile the user is sent to role selection;
 * with `role`, the wrong role is sent to their own dashboard.
 */
export function ProtectedRoute({ role, allowWithoutProfile = false, children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { loading, profile } = useProfile();
  const location = useLocation();

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  if (loading) return <Loading />;
  if (!profile && !allowWithoutProfile) return <Navigate to="/onboarding" replace />;
  if (profile && allowWithoutProfile) return <Navigate to={dashboardPath(profile.role)} replace />;
  if (role && profile && profile.role !== role) return <Navigate to={dashboardPath(profile.role)} replace />;
  return children;
}
