import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="taste-navbar">
      <div className="taste-navbar-container">

        <Link to="/" className="taste-brand" onClick={closeMenu}>
          TasteLocal
        </Link>

        <button
          className="taste-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`taste-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/food-experiences" onClick={closeMenu}>
            Food Experiences
          </Link>
          <Link to="/food-tours" onClick={closeMenu}>Food Tours</Link>
          <Link to="/my-itineraries" onClick={closeMenu}>My Itineraries</Link>
          <Link to="/my-favourites" onClick={closeMenu}>My Favourites</Link>
          <Link to="/login" onClick={closeMenu}>Login</Link>
          <Link to="/register" className="taste-signup-btn" onClick={closeMenu}>
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
