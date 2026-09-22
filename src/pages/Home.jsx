import { Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import heroImg from "../assets/segwata-bakkie-hero.jpg";

const services = [
  {
    title: "Logistics & Deliveries",
    copy:
      "Same-day and scheduled delivery for major retailers including Game, Builders Warehouse, Makro and Walmart, run in partnership with Wumdrop driver-partners.",
  },
  {
    title: "Property Renovations",
    copy:
      "Renovation and remodelling for residential and commercial properties, with tailored solutions and quality craftsmanship from start to finish.",
  },
  {
    title: "Loss Adjusting",
    copy:
      "Insurance loss adjusting delivered through our partnership with AOS Assessing, led by a certified loss adjuster on our founding team.",
  },
  {
    title: "SGT GO",
    copy:
      "Our own delivery platform connecting merchants, suppliers and drivers, launching first across Tembisa and Kempton Park before expanding province-wide.",
  },
];

const partners = ["Game", "Builders Warehouse", "Makro", "Walmart", "Wumdrop"];

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="nav__inner">
          <img src={logo} alt="Segwata Holdings" className="nav__logo" />
          <nav className="nav__links">
            <a href="#services">Services</a>
            <Link to="/sgt-go">SGT GO</Link>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <a href="#contact" className="btn btn--primary btn--small">
            Get a quote
          </a>
        </div>
      </header>

      <main>
        <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
          <div className="hero__scrim" />
          <div className="hero__content">
            <h1>
              On time. <br />
              On site. <br />
              On your side.
            </h1>
            <p className="hero__sub">
              Segwata Holdings moves freight for Gauteng's biggest retailers,
              renovates the properties they operate from, and settles the
              insurance claims when things go wrong — one reliable partner
              for all three.
            </p>
            <div className="hero__actions">
              <a href="#services" className="btn btn--primary">
                See our services
              </a>
              <Link to="/sgt-go" className="btn btn--ghost">
                Open the SGT GO app
              </Link>
            </div>
          </div>
        </section>

        <section id="services" className="services">
          <div className="section__intro">
            <h2>What we do</h2>
            <p>
              Three businesses, one standard: reliable, on-the-ground work
              that clients can trust.
            </p>
          </div>
          <ul className="services__list">
            {services.map((s) => (
              <li key={s.title} className="services__item">
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="partners">
          <p className="partners__label">Delivering for Gauteng's biggest names</p>
          <div className="partners__row">
            {partners.map((p) => (
              <span key={p} className="partners__name">
                {p}
              </span>
            ))}
          </div>
        </section>

        <section id="about" className="about">
          <div className="about__text">
            <h2>Founded in 2015, still on the road</h2>
            <p>
              Segwata Holdings started as a logistics business and grew into
              a diversified partner for retailers, property owners and
              insurers across Gauteng. Our founder is a certified loss
              adjuster at AOS Assessing, which is why our insurance work
              carries the same rigour as our deliveries.
            </p>
            <p>
              Every job — a parcel, a renovation, a claim — gets handled the
              way we'd want it handled if it were ours.
            </p>
          </div>
          <div className="about__panel">
            <div className="about__stat">
              <span>2015</span>
              <small>Founded</small>
            </div>
            <div className="about__stat">
              <span>3</span>
              <small>Business lines</small>
            </div>
            <div className="about__stat">
              <span>4+</span>
              <small>Major retail partners</small>
            </div>
          </div>
        </section>

        <section className="sgtgo-teaser">
          <div className="sgtgo-teaser__inner">
            <h2>SGT GO is here</h2>
            <p>
              A logistics platform built for South African merchants and
              suppliers — order coordination, GPS-tracked driver jobs, digital
              invoices and real-time delivery tracking, in one place.
            </p>
            <div className="sgtgo-teaser__grid">
              <div>
                <h4>Merchant dashboard</h4>
                <p>Reorder in one click, track deliveries, manage spend.</p>
              </div>
              <div>
                <h4>Supplier dashboard</h4>
                <p>Accept orders, manage stock and pricing, get paid faster.</p>
              </div>
              <div>
                <h4>Driver app</h4>
                <p>GPS jobs, proof of delivery, signature capture, earnings.</p>
              </div>
            </div>
            <div className="sgtgo-teaser__actions">
              <Link to="/sgt-go" className="btn btn--primary">
                Explore SGT GO
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="footer__inner">
          <img src={logo} alt="Segwata Holdings" className="footer__logo" />
          <div className="footer__details">
            <p>Unit 29, 343 Pongola River Drive, Norkem Park, 1618</p>
            <p>segwata@gmail.com</p>
          </div>
          <p className="footer__tagline">
            Driven by Reliability. Built on Integrity.
          </p>
        </div>
      </footer>
    </>
  );
}
