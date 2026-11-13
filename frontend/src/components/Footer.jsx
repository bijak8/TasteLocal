import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="taste-footer">
      <div className="taste-footer-container">
        {/* Column 1: Brand */}
        <div className="taste-footer-brand">
          <Link to="/" className="taste-footer-logo">
            <img
              src="/images/logos/logo-tastelocal-transparent.png"
              alt="TasteLocal"
              className="taste-footer-logo-img"
            />
          </Link>
          <p>{t('footer.brandDescription')}</p>
        </div>

        {/* Column 2: Explore */}
        <div className="taste-footer-links">
          <h4>{t('footer.explore')}</h4>
          <Link to="/food-tours">{t('footer.foodTours')}</Link>
          <Link to="/food-experiences">{t('footer.foodExperiences')}</Link>
          <Link to="/explore#local-vendors">{t('footer.localVendors')}</Link>
          <Link to="/explore">{t('footer.exploreByLocation')}</Link>
        </div>

        {/* Column 3: Company */}
        <div className="taste-footer-links">
          <h4>{t('footer.company')}</h4>
          <Link to="/about">{t('footer.aboutTasteLocal')}</Link>
          <Link to="/for-vendors">{t('footer.forVendors')}</Link>
          <Link to="/for-tour-operators">{t('footer.forTourOperators')}</Link>
          <Link to="/contact">{t('footer.contactUs')}</Link>
        </div>

        {/* Column 4: Support */}
        <div className="taste-footer-links">
          <h4>{t('footer.support')}</h4>
          <Link to="/help">{t('footer.helpCentre')}</Link>
          <Link to="/faqs">{t('footer.faqs')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
          <Link to="/privacy">{t('footer.privacyPolicy')}</Link>
        </div>

        {/* Column 5: Newsletter and Social Media */}
        <div className="taste-footer-newsletter">
          <h4>{t('footer.stayInTheLoop')}</h4>
          <p>{t('footer.newsletterDescription')}</p>
          <form
            className="taste-newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              aria-label={t('footer.emailAddress')}
              required
            />
            <button type="submit">{t('footer.subscribe')}</button>
          </form>

          <div className="taste-footer-socials">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.5 15.5v-7l6 3.5z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M19.6 7.1a5.3 5.3 0 0 1-3.3-1.1v7.5a6.2 6.2 0 1 1-5.3-6.1v3.3a2.9 2.9 0 1 0 2 2.8V2.5h3.3c.2 1.8 1.5 3.3 3.3 3.6z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="taste-footer-bottom">
        <p>
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
