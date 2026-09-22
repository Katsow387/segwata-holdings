import { useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
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
    dashboardPath: "/sgt-go/driver",
    fields: [
      { name: "fullName", label: "Full name", type: "text" },
      { name: "phone", label: "Phone number", type: "tel" },
      { name: "email", label: "Email address", type: "email" },
      { name: "vehicleType", label: "Vehicle type", type: "text" },
      { name: "licenceNumber", label: "Driver's licence number", type: "text" },
    ],
  },
};

const otherRoles = (current) =>
  Object.keys(roleConfig)
    .filter((r) => r !== current)
    .map((r) => ({ key: r, label: roleConfig[r].label }));

export default function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const config = roleConfig[role];
  if (!config) {
    return <Navigate to="/sgt-go" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // No backend yet — this just simulates account creation.
    setTimeout(() => {
      navigate(config.dashboardPath);
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <span className="auth-card__badge">SGT GO · {config.label} sign up</span>
        <h1>Create your {config.label.toLowerCase()} account</h1>
        <p className="auth-card__intro">{config.intro}</p>

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
