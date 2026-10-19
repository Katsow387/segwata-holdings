import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
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
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="hero__top">
            <h1>On time.<br />On site.<br />On your side.</h1>
            <div className="hero__side">
              <p className="hero__sub">
                Segwata Holdings moves freight for Gauteng's biggest retailers,
                renovates the properties they operate from, and settles the
                insurance claims when things go wrong. One reliable partner for all three.
              </p>
              <div className="hero__actions">
                <Link to="/quote" className="btn btn--primary">Get a delivery quote</Link>
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

      <SiteFooter />
    </>
  );
}
