import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Icon from "../components/Icon";
import cityTruck from "../assets/city-truck.jpg";
import truckImg from "../assets/truck.jpg";
import constructionImg from "../assets/construction.jpg";
import supplierImg from "../assets/supplier.jpg";
import waterproofImg from "../assets/waterproof.jpg";

const strip = [
  { icon: "truck", label: "Transport & Logistics", to: "#transport" },
  { icon: "hardhat", label: "Construction & Maintenance", to: "#construction" },
  { icon: "drop", label: "Waterproofing & Protection", to: "#waterproofing" },
  { icon: "cart", label: "Supplier Connect", to: "#supplier" },
  { icon: "phone", label: "Digital Platform", to: "#sgtgo" },
];

const values = [
  { icon: "shield", title: "Integrity", desc: "We do the right thing." },
  { icon: "users", title: "People", desc: "We invest in people." },
  { icon: "gear", title: "Reliability", desc: "We deliver on our promises." },
  { icon: "bulb", title: "Innovation", desc: "We find better ways." },
];

const blocks = [
  {
    id: "transport", num: "02", title: "Transport", accent: "& Logistics", img: truckImg, alt: "Segwata delivery truck at sunset",
    lead: "Reliable and efficient movement of goods for businesses and communities. We focus on safety, timely delivery and cost-effective solutions tailored to your needs.",
    services: ["Local and regional transport", "Distribution and last-mile deliveries", "Dedicated transport solutions", "Goods handling and coordination", "Route planning and logistics support", "Driver support and fleet coordination"],
    benefits: [["clock", "On-time delivery"], ["shield", "Safe & secure transport"], ["gear", "Cost-effective solutions"], ["chart", "Scalable services"]],
    cta: { to: "/quote", label: "Get a quote" },
  },
  {
    id: "construction", num: "03", title: "Construction", accent: "& Projects", img: constructionImg, alt: "Modern building finished by Segwata Construction",
    lead: "Professional construction and maintenance for residential, commercial and industrial properties, with a focus on quality workmanship, project management and long-term value.",
    services: ["Building construction", "Renovations and alterations", "Property maintenance", "Painting and coatings", "Repairs and improvements", "Project management"],
    benefits: [["shield", "Quality workmanship"], ["gear", "Experienced teams"], ["link", "Reliable delivery"], ["tools", "End-to-end solutions"]],
  },
  {
    id: "supplier", num: "04", title: "Supplier", accent: "Solutions", img: supplierImg, alt: "Supermarket shelves stocked with groceries",
    lead: "We connect businesses, retailers and communities with reliable suppliers, creating access to quality products and supply opportunities that support local economic growth.",
    services: ["Grocery and household sourcing", "Wholesale supplier connections", "Bulk purchasing opportunities", "Product sourcing and quotations", "Distribution coordination", "Support for small retailers and tuck shops"],
    benefits: [["tag", "Competitive pricing"], ["users", "Trusted suppliers"], ["link", "Stronger retail networks"], ["grow", "Growth opportunities"]],
  },
  {
    id: "waterproofing", num: "05", title: "Waterproofing", accent: "& Protection", img: waterproofImg, alt: "Waterproofing roller on a treated surface",
    lead: "Expert waterproofing that protects your property and investments from water damage, giving you long-term durability and peace of mind.",
    services: ["Roof waterproofing", "Leak detection and repairs", "Damp-proofing", "Waterproof membranes", "Balcony and concrete waterproofing", "Maintenance and inspections"],
    benefits: [["drop", "Stops leaks"], ["shield", "Long-lasting"], ["tools", "Expert repairs"], ["clock", "Fast response"]],
  },
];

const impact = [
  ["users", "Job creation", "Creating employment opportunities."],
  ["chart", "Local economic growth", "Supporting local suppliers and businesses."],
  ["leaf", "Sustainable solutions", "Delivering long-term value."],
  ["heart", "Community support", "Contributing to community development."],
];

export default function Home() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero__grid">
            <div className="hero__text">
              <span className="eyebrow">People · Partnerships · Progress</span>
              <h1>
                Multi-service solutions for a <span className="accent">brighter tomorrow</span>
              </h1>
              <span className="hero__rule" aria-hidden="true" />
              <p>
                Connecting people, businesses and communities through transport, logistics, construction, maintenance, waterproofing and supplier solutions.
              </p>
              <div className="hero__actions">
                <Link to="/quote" className="btn btn--primary">Get a quote</Link>
                <Link to="/sgt-go" className="btn btn--ghost">Open SGT GO</Link>
              </div>
            </div>
            <div className="hero__photo">
              <img src={cityTruck} alt="A Segwata truck driving past the Johannesburg skyline at sunset" />
            </div>
          </div>
          <div className="hero__swoosh" aria-hidden="true" />
        </section>

        {/* ICON STRIP */}
        <section className="strip" aria-label="What we do">
          <ul className="wrap strip__list">
            {strip.map((s) => (
              <li key={s.label}>
                <a href={`${import.meta.env.BASE_URL}${s.to}`}>
                  <span className="ico-circle"><Icon name={s.icon} /></span>
                  <span className="strip__label">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 01 ABOUT */}
        <section id="about" className="sect">
          <div className="wrap about">
            <div className="about__text">
              <div className="sec-title">
                <span className="sec-title__num">01</span><span className="sec-title__slash" />
                <h2>About <span className="accent">Segwata Holdings</span></h2>
              </div>
              <span className="eyebrow about__eyebrow">People · Partnerships · Progress</span>
              <p>
                Segwata Holdings (Pty) Ltd is a proudly South African multi-service company focused on creating value through transport and logistics, construction and maintenance, and supplier solutions. We are committed to delivering quality, building lasting partnerships and contributing to sustainable growth in our communities.
              </p>
              <div className="about__vm">
                <div className="panel-dark">
                  <h3><span className="ico-circle ico-circle--sm"><Icon name="eye" /></span><span className="accent">Our Vision</span></h3>
                  <p>To be a leading multi-service company known for reliability, innovation and positive impact.</p>
                </div>
                <div className="panel-dark">
                  <h3><span className="ico-circle ico-circle--sm"><Icon name="target" /></span><span className="accent">Our Mission</span></h3>
                  <p>To provide high-quality, integrated solutions that create opportunities, empower people and build sustainable communities.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="wrap values">
            <h3 className="values__title"><span>Our values</span></h3>
            <ul className="values__list">
              {values.map((v) => (
                <li key={v.title}>
                  <Icon name={v.icon} className="values__ico" />
                  <strong>{v.title}</strong>
                  <span>{v.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 02-05 SERVICES */}
        <div id="services" />
        {blocks.map((b, i) => (
          <section key={b.id} id={b.id} className={"sect sect--block" + (i % 2 ? " sect--alt" : "")}>
            <div className="wrap">
              <div className="sec-title">
                <span className="sec-title__num">{b.num}</span><span className="sec-title__slash" />
                <h2>{b.title} <span className="accent">{b.accent}</span></h2>
              </div>
              <p className="block__lead">{b.lead}</p>

              <div className={"block__main" + (i % 2 ? " is-flip" : "")}>
                <div className="panel-dark block__services">
                  <h3>Our services</h3>
                  <ul className="checks">{b.services.map((s) => <li key={s}>{s}</li>)}</ul>
                  {b.cta && <Link to={b.cta.to} className="btn btn--primary btn--small block__cta">{b.cta.label}</Link>}
                </div>
                <div className="block__photo"><img src={b.img} alt={b.alt} /></div>
              </div>

              <div className="panel-dark benefits">
                <h3 className="accent">Key benefits</h3>
                <ul>
                  {b.benefits.map(([ic, t]) => (
                    <li key={t}><span className="ico-circle ico-circle--sm"><Icon name={ic} /></span><span>{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* SGT GO */}
        <section id="sgtgo" className="sect sgt">
          <div className="wrap sgt__grid">
            <div>
              <span className="eyebrow">On-demand delivery platform</span>
              <h2 className="sgt__title">SGT<span className="accent">GO</span></h2>
              <p className="sgt__lead">Smart logistics. Real opportunities. Merchants, suppliers and drivers on one platform, launching first across Tembisa and Kempton Park.</p>
              <ul className="sgt__list">
                <li><Icon name="route" />Book deliveries easily</li>
                <li><Icon name="users" />Connect with trusted drivers</li>
                <li><Icon name="pin" />Real-time tracking</li>
                <li><Icon name="store" />Order from many suppliers in one place</li>
                <li><Icon name="grow" />Grow your business</li>
              </ul>
              <div className="hero__actions">
                <Link to="/signup" className="btn btn--primary">Create an account</Link>
                <Link to="/sgt-go" className="btn btn--ghost">Explore SGT GO</Link>
              </div>
            </div>
            <div className="phone" aria-hidden="true">
              <div className="phone__screen" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,26,48,.92) 0, rgba(8,26,48,.2) 55%, rgba(8,26,48,.85) 100%), url(${truckImg})` }}>
                <span className="phone__logo">SGT<b>GO</b></span>
                <span className="phone__tag">Delivering possibilities</span>
                <span className="phone__btn">Get started</span>
              </div>
            </div>
          </div>
        </section>

        {/* 06 IMPACT */}
        <section className="sect">
          <div className="wrap">
            <div className="sec-title">
              <span className="sec-title__num">06</span><span className="sec-title__slash" />
              <h2>Our impact <span className="accent">and commitment</span></h2>
            </div>
            <p className="block__lead">We are committed to creating opportunities, supporting local businesses and contributing to stronger, more sustainable communities.</p>
            <div className="impact">
              {impact.map(([ic, t, d]) => (
                <div key={t} className="panel-dark impact__item">
                  <span className="ico-circle ico-circle--sm"><Icon name={ic} /></span>
                  <strong>{t}</strong><span>{d}</span>
                </div>
              ))}
            </div>
            <p className="script impact__quote">Let's build a brighter tomorrow together.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
