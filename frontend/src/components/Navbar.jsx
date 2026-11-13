import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaChevronDown, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('everything');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLanguage = i18n.resolvedLanguage || i18n.language;

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
    setExploreMenuOpen(false);
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('tastelocal-language', language);
  };

  useEffect(() => {
    const updateUser = () => setUserRole(localStorage.getItem('userRole'));
    window.addEventListener('authChange', updateUser);
    return () => window.removeEventListener('authChange', updateUser);
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    navigate(`/search?q=${encodeURIComponent(keyword)}&category=${searchCategory}`);
    closeMenu();
  };

  const renderLink = (to, label) => (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={closeMenu}
      key={to}
      className={({ isActive }) => isActive ? 'taste-nav-active' : ''}
    >
      {label}
    </NavLink>
  );

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

  const renderLogout = () => (
    <button type="button" className="taste-profile-menu-button" onClick={handleLogout}>
      {t('navigation.logout')}
    </button>
  );

  const renderChangePassword = () => (
    <Link to="/change-password" onClick={closeMenu}>
      {t('navigation.changePassword')}
    </Link>
  );

  const renderForgotPassword = () => (
    <Link to="/forgot-password" onClick={closeMenu}>
      {t('navigation.forgotPassword')}
    </Link>
  );

  return (
    <nav className="taste-navbar">
      <div className="taste-navbar-container">
        {/* Brand */}
        <Link to="/" className="taste-brand" onClick={closeMenu}>
          <img
            src="/images/logos/logo-tastelocal-transparent.png"
            alt="TasteLocal"
            className="taste-brand-logo"
          />
        </Link>

        {/* Mobile hamburger button */}
        <button
          className="taste-menu-toggle"
          type="button"
          aria-label={t('navigation.toggleNavigation')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation links */}
        <div className={`taste-nav-links ${menuOpen ? 'is-open' : ''}`}>
          {/* Explore dropdown - first item on the left */}
          <div className={`taste-explore-dropdown ${exploreMenuOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className={`taste-explore-trigger ${
                location.pathname === '/explore' ? 'taste-nav-active' : ''
              }`}
              onClick={() => setExploreMenuOpen(!exploreMenuOpen)}
              aria-expanded={exploreMenuOpen}
              aria-haspopup="true"
            >
              {t('common.explore')}
              <FaChevronDown className="taste-explore-arrow" />
            </button>

            {exploreMenuOpen && (
              <div className="taste-explore-menu">
                <Link to="/explore#all-listings" onClick={closeMenu}>
                  {t('navigation.byLocation')}
                </Link>
                <Link to="/explore#local-vendors" onClick={closeMenu}>
                  {t('footer.localVendors', 'Local Vendors')}
                </Link>
              </div>
            )}
          </div>

          {renderLink('/food-experiences', t('navigation.foodExperiences'))}
          {renderLink('/food-tours', t('navigation.foodTours'))}

          {isLoggedIn && userRole === 'Tourist' && (
            renderLink('/my-bookings', t('navigation.myBookings'))
          )}
          {isLoggedIn && userRole === 'Vendor' && (
            renderLink('/provider/bookings', t('navigation.manageBookings'))
          )}
          {isLoggedIn && userRole === 'Tour Operator' && (
            renderLink('/provider/bookings', t('navigation.manageBookings'))
          )}
          {isLoggedIn && userRole === 'Admin' && (
            renderLink('/admin/dashboard', t('navigation.adminDashboard'))
          )}

          {/* Navbar Search */}
          <form className="taste-navbar-search" onSubmit={handleSearch}>
            <input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('common.searchTasteLocal')}
              aria-label={t('common.searchTasteLocal')}
            />
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              aria-label={t('common.searchCategory')}
            >
              <option value="everything">{t('common.everything')}</option>
              <option value="experiences">{t('common.experiences')}</option>
              <option value="tours">{t('common.foodTours')}</option>
            </select>
            <button type="submit" aria-label={t('common.submitSearch')}>
              <FaSearch />
            </button>
          </form>

          {/* Language selector */}
          <div className="taste-language-switcher">
            <button
              type="button"
              className={currentLanguage.startsWith('en') ? 'active' : ''}
              onClick={() => handleLanguageChange('en')}
              aria-label={t('navigation.changeToEnglish')}
              aria-pressed={currentLanguage.startsWith('en')}
            >
              EN
            </button>
            <span>|</span>
            <button
              type="button"
              className={currentLanguage.startsWith('bm') ? 'active' : ''}
              onClick={() => handleLanguageChange('bm')}
              aria-label={t('navigation.changeToMalay')}
              aria-pressed={currentLanguage.startsWith('bm')}
            >
              BM
            </button>
          </div>

          {/* Profile icon and dropdown */}
          <div className="taste-profile-dropdown">
            <button
              type="button"
              className="taste-profile-link"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-label={t('navigation.openAccountMenu')}
              aria-expanded={profileMenuOpen}
              title={t('navigation.myAccount')}
            >
              <FaUser className="taste-profile-icon" />
              <FaChevronDown className="taste-profile-arrow" />
            </button>

            {profileMenuOpen && (
              <div className="taste-profile-menu">
                {/* Vendor dropdown */}
                {isLoggedIn && userRole === 'Vendor' && (
                  <>
                    <Link to="/vendor/profile" onClick={closeMenu}>{t('navigation.myAccount')}</Link>
                    <Link to="/vendor/dashboard" onClick={closeMenu}>{t('navigation.myDashboard')}</Link>
                    <Link to="/provider/bookings" onClick={closeMenu}>{t('navigation.manageBookings')}</Link>
                    <Link to="/vendor/create-experience" onClick={closeMenu}>{t('navigation.createExperiences')}</Link>
                    <Link to="/provider/reviews" onClick={closeMenu}>{t('navigation.manageReviews')}</Link>
                    <div className="taste-profile-divider"></div>
                    {renderLogout()}
                    {renderChangePassword()}
                  </>
                )}

                {/* Tour Operator dropdown */}
                {isLoggedIn && userRole === 'Tour Operator' && (
                  <>
                    <Link to="/operator/profile" onClick={closeMenu}>{t('navigation.myAccount')}</Link>
                    <Link to="/operator/dashboard" onClick={closeMenu}>{t('navigation.myDashboard')}</Link>
                    <Link to="/provider/bookings" onClick={closeMenu}>{t('navigation.manageBookings')}</Link>
                    <Link to="/operator/create-tour" onClick={closeMenu}>{t('navigation.createTours')}</Link>
                    <Link to="/provider/reviews" onClick={closeMenu}>{t('navigation.manageReviews')}</Link>
                    <div className="taste-profile-divider"></div>
                    {renderLogout()}
                    {renderChangePassword()}
                  </>
                )}

                {/* Tourist dropdown */}
                {isLoggedIn && userRole === 'Tourist' && (
                  <>
                    <Link to="/tourist/profile" onClick={closeMenu}>{t('navigation.myAccount')}</Link>
                    <Link to="/tourist/dashboard" onClick={closeMenu}>{t('navigation.myDashboard')}</Link>
                    <Link to="/my-bookings" onClick={closeMenu}>{t('navigation.myBookings')}</Link>
                    <Link to="/my-itineraries" onClick={closeMenu}>{t('navigation.myItineraries')}</Link>
                    <Link to="/my-favourites" onClick={closeMenu}>{t('navigation.myFavourites')}</Link>
                    <Link to="/my-reviews" onClick={closeMenu}>{t('navigation.myReviews')}</Link>
                    <div className="taste-profile-divider"></div>
                    {renderLogout()}
                    {renderChangePassword()}
                  </>
                )}

                {/* Admin dropdown */}
                {isLoggedIn && userRole === 'Admin' && (
                  <>
                    <Link to="/admin/dashboard" onClick={closeMenu}>{t('navigation.adminDashboard')}</Link>
                    <Link to="/admin/users" onClick={closeMenu}>{t('navigation.manageUsers')}</Link>
                    <Link to="/admin/vendors" onClick={closeMenu}>{t('navigation.manageVendors')}</Link>
                    <Link to="/admin/tour-operators" onClick={closeMenu}>{t('navigation.manageTourOperators')}</Link>
                    <div className="taste-profile-divider"></div>
                    {renderLogout()}
                    {renderChangePassword()}
                  </>
                )}

                {/* Guest dropdown */}
                {!isLoggedIn && (
                  <>
                    <Link to="/login" onClick={closeMenu}>{t('navigation.login')}</Link>
                    <Link to="/register" onClick={closeMenu}>{t('navigation.register')}</Link>
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
