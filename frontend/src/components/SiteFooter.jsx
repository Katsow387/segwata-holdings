import logo from "../assets/segwata-logo.jpg";

export default function SiteFooter() {
  return (
    <footer id="contact" className="footer" style={{ backgroundColor: "var(--navy-950)", padding: "3rem 1.5rem", borderTop: "4px solid var(--amber-500)" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1.4rem 2.2rem" }}>
        <img src={logo} alt="Segwata Holdings" style={{ height: "50px", width: "auto", display: "block", background: "#fff", padding: ".5rem .8rem", borderRadius: "4px" }} />
        
        <div style={{ color: "#c9d8e8", fontSize: ".95rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>Gauteng, South Africa</p>
          <p style={{ marginBottom: "0.5rem" }}>
            <a href="mailto:info@segwataholdings.co.za" style={{ color: "var(--amber-500)" }}>info@segwataholdings.co.za</a>
          </p>
          <p>
            <a href="https://wa.me/27738037404" target="_blank" rel="noreferrer" style={{ color: "var(--amber-500)", fontWeight: "bold" }}>
              📞 073 803 7404 (WhatsApp)
            </a>
          </p>
        </div>
        
        <p style={{ marginLeft: "auto", color: "var(--amber-500)", fontStyle: "italic", fontSize: ".95rem", textAlign: "right" }}>
          Driven by Opportunities.<br />Built on Integrity.
        </p>
      </div>
    </footer>
  );
}