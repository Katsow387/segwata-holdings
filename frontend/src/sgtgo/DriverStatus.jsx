import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import { useAuth } from "../lib/auth";
import "./sgtgo.css";

const COPY = {
  draft: ["Your application isn't finished", "Complete every step and submit it so we can review you.", "Continue application", "/sgt-go/driver/apply"],
  more_info_required: ["We need a little more from you", "Please fix what's listed below and resubmit.", "Update application", "/sgt-go/driver/apply"],
  pending_review: ["Application received", "Our team is checking your documents. This usually takes 2 to 3 working days. We'll email you when there's a decision."],
  approved: ["You're approved. Welcome aboard!", "Your driver dashboard is ready.", "Open my dashboard", "/sgt-go/driver"],
  provisional: ["You're approved (provisional)", "You can start taking jobs while we finish a few checks.", "Open my dashboard", "/sgt-go/driver"],
  rejected: ["We couldn't approve your application", "Unfortunately your application didn't meet our requirements."],
};

export default function DriverStatus() {
  const navigate = useNavigate();
  const { application, refreshApplication, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const status = application?.status || "draft";
  const [title, text, cta, to] = COPY[status];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <span className="auth-card__badge">Driver application</span>
        <h1>{title}</h1>
        <p className="auth-card__intro">{text}</p>
        {application?.reviewer_note && <div className="apply__notice">{application.reviewer_note}</div>}
        {cta && <Link to={to} className="btn btn--primary">{cta}</Link>}
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
