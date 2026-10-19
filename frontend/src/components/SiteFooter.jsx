import logo from "../assets/segwata-logo.jpg";

export default function SiteFooter() {
  return (
    <footer id="contact" className="footer">
      <div className="footer__inner">
        <img src={logo} alt="Segwata Holdings" className="footer__logo" />
        <div className="footer__details">
          <p>Unit 29, 343 Pongola River Drive, Norkem Park, 1618</p>
          <p><a href="mailto:segwata@gmail.com">segwata@gmail.com</a></p>
        </div>
        <p className="footer__tagline">Driven by Reliability. Built on Integrity.</p>
      </div>
    </footer>
  );
}
