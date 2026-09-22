import { Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import heroImg from "../assets/sgtgo-hero.jpg";
import "./sgtgo.css";

const features = [
  {
    title: "One platform, many suppliers",
    copy: "Merchants order from multiple suppliers through a single dashboard — no more juggling calls and WhatsApp orders.",
  },
  {
    title: "GPS-tracked delivery",
    copy: "Every job is tracked from pickup to proof of delivery, with signatures captured on the driver's phone.",
  },
  {
    title: "Faster payments",
    copy: "Suppliers get paid faster with digital invoicing and automated order reconciliation.",
  },
  {
    title: "Built for South Africa",
    copy: "Designed around how Gauteng's spaza shops, cash-and-carry stores and FMCG suppliers actually order stock.",
  },
  {
    title: "Admin oversight",
    copy: "Full visibility into deliveries, disputes, pricing and driver performance from one control centre.",
  },
  {
    title: "Starting local",
    copy: "Launching first in Tembisa and Kempton Park, expanding across Gauteng and beyond as demand grows.",
  },
];

export default function Landing() {
  return (
    <div>
      <header className="sgtgo-land__nav">
        <div className="sgtgo-land__nav-inner">
          <div className="sgtgo-land__brand">
            <img src={logo} alt="Segwata Holdings" className="sgtgo-land__logo" />
            <span className="sgtgo-land__wordmark">
              SGT <em>GO</em>
            </span>
          </div>
          <nav className="sgtgo-land__nav-links">
            <Link to="/">Segwata Holdings</Link>
            <a href="#features">Features</a>
          </nav>
        </div>
      </header>

      <section className="sgtgo-land__hero">
        <img src={heroImg} alt="" className="sgtgo-land__hero-img" />
        <div className="sgtgo-land__hero-scrim" />
        <div className="sgtgo-land__hero-content">
          <h1>The ordering platform for Gauteng's merchants and suppliers</h1>
          <p>
            SGT GO connects spaza shops and retailers with FMCG suppliers,
            coordinates the order, and gets it delivered — tracked door to
            door by a Segwata Holdings driver.
          </p>
          <div className="sgtgo-land__roles">
            <Link to="/sgt-go/merchant/signup" className="btn btn--primary">
              I'm a merchant
            </Link>
            <Link to="/sgt-go/supplier/signup" className="btn btn--ghost">
              I'm a supplier
            </Link>
            <Link to="/sgt-go/driver/signup" className="btn btn--ghost">
              I'm a driver
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="sgtgo-land__body">
        <div className="sgtgo-land__features">
          {features.map((f) => (
            <div key={f.title} className="sgtgo-land__feature">
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
