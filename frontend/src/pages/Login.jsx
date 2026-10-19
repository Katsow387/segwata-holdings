import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import GoogleIcon from "../components/GoogleIcon";
import { supabase } from "../lib/supabase";
import "../sgtgo/sgtgo.css";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!supabase) return navigate("/sgt-go"); // demo mode
    const { email, password } = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setBusy(false);
      return setError(err.message === "Invalid login credentials" ? "Wrong email or password. Check both and try again." : err.message);
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    navigate(`/sgt-go/${profile?.role ?? "merchant"}`);
  };

  const handleGoogle = async () => {
    setError("");
    if (!supabase) return setError("Google log in needs Supabase. Add your keys to the .env file.");
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login`;
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (err) setError(err.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <h1>Log in to SGT GO</h1>
        <p className="auth-card__intro">Merchants, suppliers, drivers and admins all log in here.</p>

        <button type="button" className="btn-google" onClick={handleGoogle}>
          <GoogleIcon /> Continue with Google
        </button>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="auth-divider"><span>or log in with email</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field"><span>Email address</span><input type="email" name="email" required autoComplete="email" /></label>
          <label className="auth-field"><span>Password</span><input type="password" name="password" required autoComplete="current-password" /></label>
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        </form>

        <div className="auth-card__footer">
          <p>
            New here? <Link to="/sgt-go/merchant/signup">Merchant</Link> · <Link to="/sgt-go/supplier/signup">Supplier</Link> · <Link to="/sgt-go/driver/signup">Driver</Link>
          </p>
          <Link to="/" className="auth-card__back">← Back to Segwata Holdings</Link>
        </div>
      </div>
    </div>
  );
}
