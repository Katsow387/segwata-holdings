import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import { useAuth } from "../lib/auth";
import { roleLabel } from "./applicationForms";
import "./sgtgo.css";

const COPY = {
  draft: ["Your application isn't finished", "Complete every step and submit it so we can review you.", "Continue application"],
  more_info_required: ["We need a little more from you", "Please fix what's listed below and resubmit.", "Update application"],
  pending_review: ["Application received", "Our team is checking your details and documents. This usually takes 2 to 3 working days. We'll email you when there's a decision."],
  approved: ["You're approved. Welcome aboard!", "Your dashboard is ready.", "Open my dashboard"],
  provisional: ["You're approved (provisional)", "You can start taking jobs while we finish a few checks.", "Open my dashboard"],
  rejected: ["We couldn't approve your application", "Unfortunately your application didn't meet our requirements."],
};

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const { profile, application, refreshApplication, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const role = profile?.role;
  if (!application) return <Navigate to="/sgt-go/continue" replace />;

  const status = application.status || "draft";
  const [title, text, cta] = COPY[status] || COPY.pending_review;
  const to = ["approved", "provisional"].includes(status) ? `/sgt-go/${role}` : "/sgt-go/apply";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <span className="auth-card__badge">{roleLabel[role]} application</span>
        <h1>{title}</h1>
        <p className="auth-card__intro">{text}</p>
        {application.reviewer_note && <div className="apply__notice">{application.reviewer_note}</div>}
        {cta && <Link to={to} className="btn btn--primary btn--block">{cta}</Link>}
        <div className="auth-card__footer">
          <button className="apply__out" disabled={checking} onClick={async () => { setChecking(true); await refreshApplication(); setChecking(false); }}>
            {checking ? "Checking…" : "Refresh status"}
          </button>{" · "}
          <button className="apply__out" onClick={async () => { await signOut(); navigate("/login"); }}>Log out</button>
        </div>
      </div>
    </div>
  );
}
