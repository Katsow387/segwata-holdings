import { Navigate } from "react-router-dom";
import { destinationFor, useAuth } from "./auth";
import { supabase } from "./supabase";

function Splash() {
  return (
    <div className="auth-page"><div className="auth-card"><p className="auth-card__intro" style={{ margin: 0 }}>Loading…</p></div></div>
  );
}

/**
 * <RequireRole role="merchant">          dashboard: only once the application is approved
 * <RequireRole role="merchant" applicant> the apply / status pages: any application state
 * <RequireRole role="admin">             admins only
 */
export default function RequireRole({ role, applicant = false, children }) {
  const { session, profile, application, loading } = useAuth();
  if (!supabase) return children; // demo mode: no Supabase keys yet
  if (loading) return <Splash />;
  if (!session) return <Navigate to="/login" replace />;
  if (applicant) {
    if (!["merchant", "supplier", "driver"].includes(profile?.role)) return <Navigate to={destinationFor(profile, application)} replace />;
    return children;
  }
  if (profile?.role !== role || destinationFor(profile, application) !== `/sgt-go/${role}`) {
    return <Navigate to={destinationFor(profile, application)} replace />;
  }
  return children;
}

/** /sgt-go/continue: sends the person wherever they should be. */
export function Continue() {
  const { session, profile, application, loading } = useAuth();
  if (loading) return <Splash />;
  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={destinationFor(profile, application)} replace />;
}
