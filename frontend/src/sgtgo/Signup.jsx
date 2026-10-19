import { useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import GoogleIcon from "../components/GoogleIcon";
import { supabase } from "../lib/supabase";
import "./sgtgo.css";

const roleConfig = {
  merchant: {
    label: "Merchant",
    intro: "Order stock from suppliers, track deliveries, and manage your account in one place.",
    dashboardPath: "/sgt-go/merchant",
    fields: [
      { name: "businessName", label: "Business name", type: "text" },
      { name: "contactPerson", label: "Contact person", type: "text" },
      { name: "phone", label: "Phone number", type: "tel" },
      { name: "email", label: "Email address", type: "email" },
      { name: "address", label: "Store address", type: "text" },
    ],
  },
  supplier: {
    label: "Supplier",
    intro: "Receive orders from merchants across Gauteng and get paid faster.",
    dashboardPath: "/sgt-go/supplier",
    fields: [
      { name: "companyName", label: "Company name", type: "text" },
      { name: "contactPerson", label: "Contact person", type: "text" },
      { name: "phone", label: "Phone number", type: "tel" },
      { name: "email", label: "Email address", type: "email" },
      { name: "products", label: "Products supplied", type: "text" },
    ],
  },
  driver: {
    label: "Driver",
    intro: "Get delivery jobs, navigate with GPS, and track your earnings.",
    dashboardPath: "/sgt-go/driver/apply",
    fields: [
      { name: "fullName", label: "Full name", type: "text" },
      { name: "phone", label: "Phone number", type: "tel" },
      { name: "email", label: "Email address", type: "email" },
      { name: "vehicleType", label: "Vehicle type", type: "text" },
      { name: "licenceNumber", label: "Driver's licence number", type: "text" },
    ],
  },
};

const friendly = (m) => {
  if (/database error/i.test(m)) {
    console.error("Supabase sign-up error:", m);
    return import.meta.env.DEV
      ? "Database error: run 0001, 0002 and 0003 .sql files in the Supabase SQL Editor, then try again."
      : "We couldn't create your account right now. Please try again shortly.";
  }
  return m;
};

const otherRoles = (current) =>
  Object.keys(roleConfig)
    .filter((r) => r !== current)
    .map((r) => ({ key: r, label: roleConfig[r].label }));

export default function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const config = roleConfig[role];
  if (!config) {
    return <Navigate to="/sgt-go" replace />;
  }

  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}sgt-go/${role}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password, ...rest } = Object.fromEntries(new FormData(e.currentTarget));
    if (!supabase) {
      // Demo mode: no Supabase keys yet.
      setSubmitting(true);
      setTimeout(() => navigate(config.dashboardPath), 400);
      return;
    }
    setSubmitting(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { role, full_name: rest.contactPerson || rest.fullName, phone: rest.phone, signup_data: rest },
      },
    });
    setSubmitting(false);
    if (err) return setError(friendly(err.message));
    if (data.user && data.user.identities?.length === 0) {
      return setError("An account with this email already exists. Please log in instead.");
    }
    if (data.session) {
      const { data: saved } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
      if (!saved) return setError("Your account was created but your details weren't saved. Please contact us.");
      navigate(config.dashboardPath);
    } else setSent(true);
  };

  const handleGoogle = async () => {
    setError("");
    if (!supabase) return setError("Google sign-up needs Supabase. Add your keys to the .env file.");
    localStorage.setItem("sgtgo.pendingRole", role);
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (err) setError(err.message);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
          <h1>Check your email</h1>
          <p className="auth-card__intro">
            We sent a confirmation link to your email address. Open it to finish creating your {config.label.toLowerCase()} account.
          </p>
          <Link to="/login" className="btn btn--outline">Go to log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <span className="auth-card__badge">SGT GO · {config.label} sign up</span>
        <h1>Create your {config.label.toLowerCase()} account</h1>
        <p className="auth-card__intro">{config.intro}</p>

        <button type="button" className="btn-google" onClick={handleGoogle}>
          <GoogleIcon /> Continue with Google
        </button>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="auth-divider"><span>or sign up with email</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          {config.fields.map((f) => (
            <label key={f.name} className="auth-field">
              <span>{f.label}</span>
              <input type={f.type} name={f.name} required />
            </label>
          ))}
          <label className="auth-field">
            <span>Password</span>
            <input type="password" name="password" required />
          </label>

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>
            Not a {config.label.toLowerCase()}?{" "}
            {otherRoles(role).map((r, i) => (
              <span key={r.key}>
                <Link to={`/sgt-go/${r.key}/signup`}>Sign up as {r.label.toLowerCase()}</Link>
                {i < otherRoles(role).length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
          <Link to="/sgt-go" className="auth-card__back">
            ← Back to SGT GO
          </Link>
        </div>
      </div>
    </div>
  );
}
