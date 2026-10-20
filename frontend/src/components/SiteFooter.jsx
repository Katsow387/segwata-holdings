import logo from "../assets/segwata-logo.jpg";
import Icon from "./Icon";

export default function SiteFooter() {
  return (
    <footer id="contact" className="ftr">
      <div className="wrap ftr__grid">
        <div className="ftr__brand">
          <img src={logo} alt="Segwata Holdings" className="ftr__logo" />
          <p className="script ftr__script">Driven by Opportunities.</p>
          <span className="eyebrow">Built on integrity</span>
        </div>

        <ul className="ftr__contact">
          <li><span className="ico-circle ico-circle--sm"><Icon name="phone" /></span>
            <a href="https://wa.me/27738037404" target="_blank" rel="noreferrer">073 803 7404 <small>WhatsApp</small></a></li>
          <li><span className="ico-circle ico-circle--sm"><Icon name="mail" /></span>
            <a href="mailto:info@segwataholdings.co.za">info@segwataholdings.co.za</a></li>
          <li><span className="ico-circle ico-circle--sm"><Icon name="pin" /></span>
            <span>Gauteng, South Africa</span></li>
        </ul>
      </div>
      <div className="ftr__bar">
        <div className="wrap ftr__bar-in">
          <span>Segwata Holdings (Pty) Ltd · Company profile 2026</span>
          <span>Driven by reliability. Built on integrity.</span>
        </div>
      </div>
    </footer>
  );
}
