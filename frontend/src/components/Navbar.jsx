
import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { FaUser, FaChevronDown } from 'react-icons/fa';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole')
  );

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  // Update navigation after login or logout
  useEffect(() => {
    const updateUser = () => {
      setUserRole(localStorage.getItem('userRole'));
    };

    window.addEventListener('authChange', updateUser);

    return () => {
      window.removeEventListener('authChange', updateUser);
    };
  }, []);

  // Close dropdown when navigating to another page
  useEffect(() => {
    setProfileMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const isLoggedIn = Boolean(
    localStorage.getItem('accessToken')
  );

  // Reusable active navigation link
  const renderLink = (to, label) => (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={closeMenu}
      key={to}
      className={({ isActive }) =>
        isActive ? 'taste-nav-active' : ''
      }
    >
      {label}
    </NavLink>
  );

  // Log out user
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfile');

    window.dispatchEvent(new Event('authChange'));

    closeMenu();
    navigate('/');
  };

  // Reusable logout button
  const renderLogout = () => (
    <button
      type="button"
      className="taste-profile-menu-button"
      onClick={handleLogout}
    >
      Log Out
    </button>
  );

  // Change password link
  const renderChangePassword = () => (
    <Link to="/change-password" onClick={closeMenu}>
      Change Password
    </Link>
  );

  // Forgot password link
  const renderForgotPassword = () => (
    <Link to="/forgot-password" onClick={closeMenu}>
      Forgot / Reset Password
    </Link>
  );

  return (
    <nav className="taste-navbar">
      <div className="taste-navbar-container">

        {/* Brand */}
        <Link
          to="/"
          className="taste-brand"
          onClick={closeMenu}
        >
          TasteLocal
        </Link>

        {/* Mobile hamburger button */}
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

        {/* Navigation links */}
        <div className={`taste-nav-links ${menuOpen ? 'is-open' : ''}`}>

          {/* Public navigation */}
          {renderLink('/', 'Home')}
          {renderLink('/food-experiences', 'Food Experiences')}
          {renderLink('/food-tours', 'Food Tours')}

          {/* Tourist standalone navigation */}
          {isLoggedIn && userRole === 'Tourist' && (
            renderLink('/my-bookings', 'My Bookings')
          )}

          {/* Vendor standalone navigation */}
          {isLoggedIn && userRole === 'Vendor' && (
            renderLink('/provider/bookings', 'Manage Bookings')
          )}

          {/* Tour Operator standalone navigation */}
          {isLoggedIn && userRole === 'Tour Operator' && (
            renderLink('/provider/bookings', 'Manage Bookings')
          )}

          {/* Admin navigation */}
          {isLoggedIn && userRole === 'Admin' && (
            renderLink('/admin/dashboard', 'Admin Dashboard')
          )}

          {/* Profile icon and dropdown */}
          <div className="taste-profile-dropdown">

            <button
              type="button"
              className="taste-profile-link"
              onClick={() =>
                setProfileMenuOpen(!profileMenuOpen)
              }
              aria-label="Open account menu"
              aria-expanded={profileMenuOpen}
              title="My Account"
            >
              <FaUser className="taste-profile-icon" />
              <FaChevronDown className="taste-profile-arrow" />
            </button>

            {profileMenuOpen && (
              <div className="taste-profile-menu">

                {/* Vendor dropdown */}
                {isLoggedIn && userRole === 'Vendor' && (
                  <>
                    <Link
                      to="/vendor/profile"
                      onClick={closeMenu}
                    >
                      My Account
                    </Link>

                    <Link
                      to="/vendor/dashboard"
                      onClick={closeMenu}
                    >
                      My Dashboard
                    </Link>

                    <Link
                      to="/provider/bookings"
                      onClick={closeMenu}
                    >
                      Manage Bookings
                    </Link>

                    <Link
                      to="/vendor/create-experience"
                      onClick={closeMenu}
                    >
                      Create Experiences
                    </Link>

                    <Link
                      to="/provider/reviews"
                      onClick={closeMenu}
                    >
                      Manage Reviews
                    </Link>
<div className="taste-profile-divider"></div>

{renderLogout()}

{renderChangePassword()}
                  </>
                )}

                {/* Tour Operator dropdown */}
                {isLoggedIn && userRole === 'Tour Operator' && (
                  <>
                    <Link
                      to="/operator/profile"
                      onClick={closeMenu}
                    >
                      My Account
                    </Link>

                    <Link
                      to="/operator/dashboard"
                      onClick={closeMenu}
                    >
                      My Dashboard
                    </Link>

                    <Link
                      to="/provider/bookings"
                      onClick={closeMenu}
                    >
                      Manage Bookings
                    </Link>

                    <Link
                      to="/operator/create-tour"
                      onClick={closeMenu}
                    >
                      Create Tours
                    </Link>

                    <Link
                      to="/provider/reviews"
                      onClick={closeMenu}
                    >
                      Manage Reviews
                    </Link>

<div className="taste-profile-divider"></div>

{renderLogout()}

{renderChangePassword()}
                  </>
                )}

                {/* Tourist dropdown */}
                {isLoggedIn && userRole === 'Tourist' && (
                  <>
                    <Link
                      to="/tourist/profile"
                      onClick={closeMenu}
                    >
                      My Account
                    </Link>

                    <Link
                      to="/tourist/dashboard"
                      onClick={closeMenu}
                    >
                      My Dashboard
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={closeMenu}
                    >
                      My Bookings
                    </Link>

                    <Link
                      to="/my-itineraries"
                      onClick={closeMenu}
                    >
                      My Itineraries
                    </Link>

                    <Link
                      to="/my-favourites"
                      onClick={closeMenu}
                    >
                      My Favourites
                    </Link>

                    <Link
                      to="/my-reviews"
                      onClick={closeMenu}
                    >
                      My Reviews
                    </Link>

<div className="taste-profile-divider"></div>

{renderLogout()}

{renderChangePassword()}
                  </>
                )}

                {/* Admin dropdown */}
                {isLoggedIn && userRole === 'Admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={closeMenu}
                    >
                      Admin Dashboard
                    </Link>

<div className="taste-profile-divider"></div>

{renderLogout()}

{renderChangePassword()}
                  </>
                )}

                {/* Guest dropdown */}
                {!isLoggedIn && (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenu}
                    >
                      Sign Up
                    </Link>

                    <div className="taste-profile-divider"></div>

                    {renderForgotPassword()}
                  </>
                )}

              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
