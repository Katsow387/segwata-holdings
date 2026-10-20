import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import Icon from "./Icon";

const base = import.meta.env.BASE_URL;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link to="/" onClick={close} className="hdr__logo-link">
          <img src={logo} alt="Segwata Holdings" className="hdr__logo" />
        </Link>

        <nav className={"hdr__nav" + (open ? " is-open" : "")} aria-label="Main">
          <a href={`${base}#services`} onClick={close}>Services</a>
          <Link to="/sgt-go" onClick={close}>SGT GO</Link>
          <a href={`${base}#about`} onClick={close}>About</a>
          <a href={`${base}#contact`} onClick={close}>Contact</a>
          <Link to="/quote" onClick={close} className="btn btn--primary btn--small hdr__cta-in">Get a quote</Link>
        </nav>

        <Link to="/quote" className="btn btn--primary btn--small hdr__cta">Get a quote</Link>
        <button type="button" className="hdr__burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}
