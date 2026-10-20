import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import heroImg from "../assets/segwata-bakkie-hero.jpg";

const services = [
  {
    title: "Transport & Logistics",
    copy: "Local and regional transport, distribution, and last-mile deliveries. We provide safe, secure, and cost-effective solutions tailored to your needs.",
  },
  {
    title: "Construction & Maintenance",
    copy: "Building construction, renovations, property maintenance, painting, and project management. Delivering quality workmanship for residential and commercial properties.",
  },
  {
    title: "Waterproofing & Protection",
    copy: "Professional waterproofing solutions to protect your property and investments from water damage, ensuring long-term durability.",
  },
  {
    title: "Supplier Connect",
    copy: "Connecting businesses, retailers, and communities with reliable suppliers. Grocery sourcing, wholesale connections, and bulk purchasing opportunities.",
  },
  {
    title: "SGT GO (Digital Platform)",
    copy: "Our own delivery platform connecting merchants, suppliers and drivers. Launching first across Tembisa and Kempton Park before expanding province-wide.",
  },
];

const values = [
  { title: "Integrity", desc: "We do the right thing." },
  { title: "People", desc: "We invest in people." },
  { title: "Reliability", desc: "We deliver on our promises." },
  { title: "Innovation", desc: "We find better ways." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* HERO SECTION WITH BAKKIE */}
        <section className="hero" style={{ backgroundColor: "var(--navy-950)" }}>
          <div className="hero__top">
            <h1 style={{ color: "var(--white)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1 }}>
              Multi-Service<br />Solutions For A<br /><span style={{ color: "var(--amber-500)" }}>Brighter Tomorrow</span>
            </h1>
            <div className="hero__side">
              <p className="hero__sub">
                Connecting people, businesses, and communities through transport, logistics, construction, maintenance, waterproofing, and supplier solutions.
              </p>
              <div className="hero__actions">
                <Link to="/quote" className="btn btn--primary">Get a Quote</Link>
                <Link to="/sgt-go" className="btn btn--ghost">Open SGT GO</Link>
              </div>
            </div>
          </div>
          
          <div className="hero__scene">
            <img src={heroImg} alt="A Segwata Holdings bakkie driving above Johannesburg at dusk" className="hero__img" />
            <span className="hero__road hero__road--far" aria-hidden="true" />
            <span className="hero__road" aria-hidden="true" />
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="services" style={{ padding: "5rem 1.5rem" }}>
          <div className="section__intro" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2.5rem" }}>Our Services</h2>
            <p style={{ color: "var(--muted)", marginTop: "1rem", maxWidth: "600px", margin: "1rem auto" }}>
              Diverse solutions for transport, construction, maintenance, and supplier networking.
            </p>
          </div>
          <ul className="services__list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", maxWidth: "1180px", margin: "0 auto" }}>
            {services.map((s) => (
              <li key={s.title} style={{ padding: "2rem", background: "var(--ice-50)", borderRadius: "8px", borderTop: "4px solid var(--amber-500)" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{s.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>{s.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ABOUT SECTION WITH VALUES ON THE RIGHT */}
        <section id="about" className="about" style={{ backgroundColor: "var(--navy-950)", color: "var(--white)", padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "1180px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "4rem", alignItems: "start" }}>
            
            {/* Left Side: Text & Vision/Mission */}
            <div>
              <h2 style={{ color: "var(--white)", fontSize: "2.5rem", marginBottom: "1.5rem" }}>About Segwata Holdings</h2>
              <p style={{ color: "#c9d8e8", fontSize: "1.05rem", marginBottom: "2rem", lineHeight: "1.6" }}>
                A proudly South African multi-service company focused on creating value through transport and logistics, construction, maintenance, and supplier solutions. We are committed to delivering quality, building lasting partnerships, and contributing to sustainable growth in our communities.
              </p>
              
              <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
                 <div style={{ flex: 1 }}>
                    <h4 style={{ color: "var(--amber-500)", marginBottom: "0.5rem" }}>Our Vision</h4>
                    <p style={{ color: "#c9d8e8", fontSize: "0.95rem" }}>To be a leading multi-service company known for reliability, innovation and positive impact.</p>
                 </div>
                 <div style={{ flex: 1 }}>
                    <h4 style={{ color: "var(--amber-500)", marginBottom: "0.5rem" }}>Our Mission</h4>
                    <p style={{ color: "#c9d8e8", fontSize: "0.95rem" }}>To provide high-quality, integrated solutions that create opportunities and empower people.</p>
                 </div>
              </div>
            </div>
            
            {/* Right Side: Our Values */}
            <div style={{ 
              background: "rgba(255,255,255,0.05)", 
              padding: "2.5rem", 
              borderRadius: "8px", 
              border: "1px solid rgba(244, 179, 38, 0.3)",
              justifySelf: "end", 
              width: "100%" 
            }}>
              <h3 style={{ color: "var(--amber-500)", marginBottom: "2rem", fontSize: "1.5rem", textAlign: "left" }}>Our Values</h3>
              <ul style={{ display: "grid", gap: "1.5rem" }}>
                {values.map(v => (
                  <li key={v.title}>
                    <strong style={{ color: "var(--white)", display: "block", fontSize: "1.1rem", marginBottom: "0.3rem" }}>{v.title}</strong>
                    <span style={{ color: "#c9d8e8", fontSize: "0.95rem" }}>{v.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SGT GO TEASER */}
        <section className="sgtgo-teaser" style={{ background: "var(--amber-500)", padding: "5rem 1.5rem", textAlign: "center" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ color: "var(--navy-950)", fontSize: "2.5rem" }}>SGT GO is here</h2>
            <p style={{ color: "var(--navy-800)", marginTop: "1rem", fontSize: "1.1rem", fontWeight: 500 }}>
              A logistics platform built for South African merchants and suppliers — order coordination, GPS-tracked driver jobs, digital invoices and real-time delivery tracking, in one place.
            </p>
            <div style={{ marginTop: "2rem" }}>
              <Link to="/sgt-go" className="btn btn--outline" style={{ backgroundColor: "var(--navy-950)", color: "var(--white)", border: "none" }}>
                Explore SGT GO
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}