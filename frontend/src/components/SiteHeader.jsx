import { Link } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";

export default function SiteHeader() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/"><img src={logo} alt="Segwata Holdings" className="nav__logo" /></Link>
        <nav className="nav__links" aria-label="Main">
          <a href="/segwata-holdings/#services">Services</a>
          <Link to="/sgt-go">SGT GO</Link>
          <a href="/segwata-holdings/#about">About</a>
          <a href="#contact">Contact</a>
          <Link to="/login">Log in</Link>
        </nav>
        <Link to="/quote" className="btn btn--primary btn--small">Get a quote</Link>
      </div>
    </header>
  );
}
