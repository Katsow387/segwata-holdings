import { Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";

export default function SiteHeader() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(8, 26, 48, 0.98)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link to="/">
          <img src={logo} alt="Segwata Holdings" style={{ height: "45px", width: "auto", objectFit: "contain", display: "block", background: "#fff", padding: "4px 8px", borderRadius: "4px" }} />
        </Link>
        <nav style={{ display: "flex", gap: "1.8rem", marginLeft: "auto", fontWeight: 600, fontSize: ".9rem", color: "var(--white)", textTransform: "uppercase" }} aria-label="Main">
          <a href={`${import.meta.env.BASE_URL}#services`} style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "var(--amber-500)"} onMouseOut={(e) => e.target.style.color = "var(--white)"}>Services</a>
          <Link to="/sgt-go" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "var(--amber-500)"} onMouseOut={(e) => e.target.style.color = "var(--white)"}>SGT GO</Link>
          <a href={`${import.meta.env.BASE_URL}#about`} style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "var(--amber-500)"} onMouseOut={(e) => e.target.style.color = "var(--white)"}>About</a>
          <a href="#contact" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "var(--amber-500)"} onMouseOut={(e) => e.target.style.color = "var(--white)"}>Contact</a>
        </nav>
        <Link to="/quote" className="btn btn--primary btn--small">Get a quote</Link>
      </div>
    </header>
  );
}