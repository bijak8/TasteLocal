
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="taste-footer">
      <div className="taste-footer-container">

        <div className="taste-footer-brand">
          <Link to="/" className="taste-footer-logo">
              <img
            src="/images/logos/logo-tastelocal-transparent.png"
            alt="TasteLocal"
            className="taste-brand-logo"
          />
          </Link>
          <p>
            Discover local food, culture and experiences.
            Explore destinations through the flavours of each place.
          </p>
        </div>

        <div className="taste-footer-links">
          <h4>Explore</h4>
          <Link to="/food-experiences">Food Experiences</Link>
          <Link to="/food-tours">Food Tours</Link>
        </div>

        <div className="taste-footer-links">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Sign Up</Link>
        </div>

      </div>

      <div className="taste-footer-bottom">
        <p>© {new Date().getFullYear()} TasteLocal. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;