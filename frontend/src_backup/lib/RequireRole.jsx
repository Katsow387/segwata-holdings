import { Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import { supabaseReady } from "./supabase";

const Wait = () => <p style={{ padding: "3rem", textAlign: "center" }}>Loading…</p>;
const APPROVED = ["approved", "provisional"];

export default function RequireRole({ role, needsApproval = false, children }) {
  const { session, profile, application, loading } = useAuth();
  if (!supabaseReady) return children; // demo mode until Supabase keys are added
  if (loading) return <Wait />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile || application === undefined) return <Wait />;
  if (profile.role !== role && profile.role !== "admin") {
    return <Navigate to={`/sgt-go/${profile.role}`} replace />;
  }
  if (needsApproval && profile.role !== "admin" && !APPROVED.includes(application?.status)) {
    const s = application?.status;
    const to = s === "pending_review" || s === "rejected" ? `/sgt-go/${role}/status` : `/sgt-go/${role}/apply`;
    return <Navigate to={to} replace />;
  }
  return children;
}
