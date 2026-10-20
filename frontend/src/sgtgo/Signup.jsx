import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import GoogleIcon from "../components/GoogleIcon";
import Icon from "../components/Icon";
import { supabase } from "../lib/supabase";
import { phone as validPhone } from "./applicationForms";
import "./sgtgo.css";

const ROLES = [
  { key: "merchant", label: "Merchant", icon: "store", desc: "I buy stock for my shop" },
  { key: "supplier", label: "Supplier", icon: "box", desc: "I supply products" },
  { key: "driver", label: "Driver", icon: "truck", desc: "I deliver orders" },
];

const friendly = (m) => {
  if (/database error/i.test(m)) {
    console.error("Supabase sign-up error:", m);
    return import.meta.env.DEV
      ? "Database error: run the .sql files in the Supabase SQL Editor (including 0004), then try again."
      : "We couldn't create your account right now. Please try again shortly.";
  }
  return m;
};

export default function Signup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initial = ROLES.some((r) => r.key === params.get("role")) ? params.get("role") : "";
  const [role, setRole] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const redirectTo = `${base}sgt-go/continue`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!role) return setError("Choose what you're signing up as: merchant, supplier or driver.");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const msg = validPhone(f.phone);
    if (msg) return setError(msg);
    if (f.password.length < 8) return setError("Use a password with at least 8 characters.");

    if (!supabase) { // demo mode: no Supabase keys yet
      setSubmitting(true);
      setTimeout(() => navigate(`/sgt-go/${role}`), 400);
      return;
    }
    setSubmitting(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: f.email.trim(),
      password: f.password,
      options: {
        emailRedirectTo: redirectTo,
        data: { role, full_name: f.fullName.trim(), phone: f.phone.trim(), signup_data: { fullName: f.fullName.trim(), phone: f.phone.trim() } },
      },
    });
    setSubmitting(false);
    if (err) return setError(friendly(err.message));
    if (data.user && data.user.identities?.length === 0) {
      return setError("An account with this email already exists. Please log in instead.");
    }
    if (data.session) navigate("/sgt-go/continue"); // goes straight to the right application form
    else setSent(true);
  };

  const handleGoogle = async () => {
    setError("");
    if (!role) return setError("Choose what you're signing up as first: merchant, supplier or driver.");
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
            We sent a confirmation link to your email address. Open it to finish creating your account. You'll then be taken straight to your {role} application form.
          </p>
          <Link to="/login" className="btn btn--outline btn--block">Go to log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <span className="auth-card__badge">SGT GO · Sign up</span>
        <h1>Create your account</h1>
        <p className="auth-card__intro">One quick sign-up. After this you'll fill in a short application, and our team will review it before your dashboard opens.</p>

        <fieldset className="rolepick">
          <legend>I am a…</legend>
          <div className="rolepick__grid" role="radiogroup" aria-label="Account type">
            {ROLES.map((r) => (
              <button key={r.key} type="button" role="radio" aria-checked={role === r.key}
                className={"rolepick__opt" + (role === r.key ? " is-on" : "")} onClick={() => { setRole(r.key); setError(""); }}>
                <Icon name={r.icon} />
                <strong>{r.label}</strong>
                <small>{r.desc}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <button type="button" className="btn-google" onClick={handleGoogle}>
          <GoogleIcon /> Continue with Google
        </button>
        <div className="auth-divider"><span>or sign up with email</span></div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate={false}>
          <label className="auth-field"><span>Full name</span><input type="text" name="fullName" required autoComplete="name" /></label>
          <label className="auth-field"><span>Cell phone number</span><input type="tel" name="phone" required autoComplete="tel" inputMode="tel" placeholder="082 123 4567" /></label>
          <label className="auth-field"><span>Email address</span><input type="email" name="email" required autoComplete="email" /></label>
          <label className="auth-field"><span>Password <small>(at least 8 characters)</small></span><input type="password" name="password" required minLength={8} autoComplete="new-password" /></label>

          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
          <Link to="/sgt-go" className="auth-card__back">← Back to SGT GO</Link>
        </div>
      </div>
    </div>
  );
}
