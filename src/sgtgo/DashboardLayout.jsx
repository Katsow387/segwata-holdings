import { Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";

const roleSwitcher = [
  { label: "Merchant", to: "/sgt-go/merchant" },
  { label: "Supplier", to: "/sgt-go/supplier" },
  { label: "Driver", to: "/sgt-go/driver" },
  { label: "Admin", to: "/sgt-go/admin" },
];

export default function DashboardLayout({ role, roleLabel, navItems, children }) {
  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <img src={logo} alt="Segwata Holdings" className="dash__logo" />
        <div className="dash__brand">
          SGT <span>GO</span>
        </div>
        <div className="dash__role">{roleLabel} dashboard</div>

        <nav className="dash__nav">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="dash__switch">
          <span className="dash__switch-label">Switch view</span>
          <div className="dash__switch-links">
            {roleSwitcher
              .filter((r) => r.to !== `/sgt-go/${role}`)
              .map((r) => (
                <Link key={r.to} to={r.to}>
                  {r.label}
                </Link>
              ))}
          </div>
        </div>

        <Link to="/sgt-go" className="dash__back">
          ← Back to SGT GO home
        </Link>
      </aside>

      <main className="dash__main">{children}</main>
    </div>
  );
}
