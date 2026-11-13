
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

const TOUR_FALLBACK_IMAGE = '/images/home/tour-kl-street-food.jpg';
const EXPERIENCE_FALLBACK_IMAGE =
  '/images/home/experience-traditional-cooking.jpg';

const isSingaporeListing = (item) => {
  const singapore = 'singapore';

  const locationFields = [
    item.city,
    item.country,
    item.location,
    item.address,
    item.full_address,
  ];

  return locationFields.some(
    (value) =>
      typeof value === 'string' &&
      value.toLowerCase().includes(singapore)
  );
};

const getListingImage = (item, fallback) =>
  item.image ||
  item.cover_image ||
  item.image_url ||
  item.photo ||
  item.thumbnail ||
  fallback;

const formatPrice = (price, language) => {
  if (price === null || price === undefined || price === '') {
    return language === 'bm'
      ? 'Harga tidak tersedia'
      : 'Price unavailable';
  }

  const numericPrice = Number(String(price).replace(/[^\d.-]/g, ''));

  if (!Number.isFinite(numericPrice)) {
    return `S$${price}`;
  }

  return new Intl.NumberFormat(
    language === 'bm' ? 'ms-MY' : 'en-SG',
    {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 2,
    }
  ).format(numericPrice);
};

const formatDuration = (duration, language) => {
  if (
    duration === null ||
    duration === undefined ||
    duration === ''
  ) {
    return null;
  }

  if (typeof duration === 'string') return duration;

  if (language === 'bm') {
    return `${duration} ${Number(duration) === 1 ? 'jam' : 'jam'}`;
  }

  return `${duration} ${Number(duration) === 1 ? 'hour' : 'hours'}`;
};

const getRating = (item) =>
  item.average_rating ?? item.rating ?? item.average_review_rating;

const getReviewCount = (item) =>
  item.review_count ?? item.total_reviews ?? item.reviews_count;

function ListingCard({ item, type, language }) {
  const isTour = type === 'tour';

  const fallbackImage = isTour
    ? TOUR_FALLBACK_IMAGE
    : EXPERIENCE_FALLBACK_IMAGE;

  const image = getListingImage(item, fallbackImage);
  const location = item.area || item.city || item.address || 'Singapore';
  const rating = getRating(item);
  const reviewCount = getReviewCount(item);

  const duration = formatDuration(
    item.duration || item.duration_hours || item.estimated_duration,
    language
  );

  const detailsPath = isTour
    ? `/food-tours/${item.id}`
    : `/food-experiences/${item.id}`;

  const reviewsLabel =
    language === 'bm' ? 'ulasan' : 'reviews';

  return (
    <article className="home-listing-card">
      <Link
        to={detailsPath}
        className="home-listing-image-link"
        aria-label={
          language === 'bm'
            ? `Lihat ${item.title}`
            : `View ${item.title}`
        }
      >
        <img
          src={image}
          alt={item.title}
          className="home-listing-image"
          loading="lazy"
          onError={(event) => {
            if (!event.currentTarget.dataset.fallbackApplied) {
              event.currentTarget.dataset.fallbackApplied = 'true';
              event.currentTarget.src = fallbackImage;
            }
          }}
        />

        <span className="home-location-badge">
          <span aria-hidden="true">●</span> {location}
        </span>
      </Link>

      <div className="home-listing-details">
        <h3>
          <Link to={detailsPath}>{item.title}</Link>
        </h3>

        {rating !== null &&
          rating !== undefined &&
          rating !== '' && (
            <p className="home-listing-rating">
              <span aria-hidden="true">★</span>{' '}
              {Number(rating).toFixed(1)}

              {reviewCount !== null &&
                reviewCount !== undefined &&
                ` (${reviewCount} ${reviewsLabel})`}
            </p>
          )}

        {item.description && (
          <p className="home-listing-description">
            {item.description}
          </p>
        )}

        <div className="home-listing-meta">
          {duration && <span>◷ {duration}</span>}
          <strong>{formatPrice(item.price, language)}</strong>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const { t, i18n } = useTranslation();

  const language = i18n.resolvedLanguage?.startsWith('bm')
    ? 'bm'
    : 'en';

  const [foodTours, setFoodTours] = useState([]);
  const [foodExperiences, setFoodExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchHomeListings = async () => {
      try {
        const [toursResponse, experiencesResponse] = await Promise.all([
          API.get('food-tours/'),
          API.get('food-experiences/'),
        ]);

        const toursData = Array.isArray(toursResponse.data)
          ? toursResponse.data
          : toursResponse.data.results ?? [];

        const experiencesData = Array.isArray(experiencesResponse.data)
          ? experiencesResponse.data
          : experiencesResponse.data.results ?? [];

        if (cancelled) return;

        const singaporeTours = toursData
          .filter(isSingaporeListing)
          .slice(0, 3);

        const singaporeExperiences = experiencesData
          .filter(isSingaporeListing)
          .slice(0, 4);

        setFoodTours(singaporeTours);
        setFoodExperiences(singaporeExperiences);
      } catch (fetchError) {
        console.error('Error loading homepage listings:', fetchError);

        if (!cancelled) {
          setError(t('home.loadError'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHomeListings();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const hasListings = useMemo(
    () => foodTours.length > 0 || foodExperiences.length > 0,
    [foodTours, foodExperiences]
  );

  return (
    <main className="home-page">

      {/* Hero section */}
      <header className="home-hero">
        <div className="container-custom home-hero-content">

          <span className="home-eyebrow">
            {t('home.eyebrow')}
          </span>

          <h1>
            {t('home.heroLine1')}
            <br />
            {t('home.heroLine2')} <span>&amp;</span>{' '}
            {t('home.heroLine3')}
          </h1>

          <p>
            {t('home.subtitle')}
          </p>

          <div className="home-hero-buttons">

            <Link
              to="/food-experiences"
              className="taste-btn-primary"
            >
              {t('home.exploreExperiences')}
            </Link>

            <Link
              to="/food-tours"
              className="taste-btn-secondary"
            >
              {t('home.exploreTours')}
            </Link>

            <Link
              to="/my-itineraries"
              className="taste-btn-outline"
            >
              {t('home.planTrip')}
            </Link>

          </div>
        </div>

        <div className="home-hero-wave">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="
                M0,45
                C220,15 380,85 610,95
                C850,115 1050,75 1210,25
                C1300,0 1350,0 1440,10
                L1440,120
                L0,120
                Z
              "
              fill="#fffaf2"
            />
          </svg>
        </div>
      </header>

      {/* Loading message */}
      {loading && (
        <div className="home-listings-message">
          {t('home.loadingListings')}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="home-listings-message home-listings-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>

          {/* Browse food tours */}
          <section
            className="home-browse-section section-padding"
            aria-labelledby="browse-tours-title"
          >
            <div className="container-custom">

              <div className="home-browse-heading">
                <h2 id="browse-tours-title">
                  {t('home.browseTours')}
                </h2>

                <Link
                  to="/food-tours"
                  className="home-view-all-link"
                >
                  {t('home.viewAllTours')}{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {foodTours.length > 0 ? (
                <div className="home-listing-grid home-tour-grid">
                  {foodTours.map((tour) => (
                    <ListingCard
                      key={tour.id}
                      item={tour}
                      type="tour"
                      language={language}
                    />
                  ))}
                </div>
              ) : (
                <p className="home-listings-empty">
                  {t('home.noTours')}
                </p>
              )}

            </div>
          </section>

          {/* Browse food experiences */}
          <section
            className="home-browse-section home-experiences-section section-padding"
            aria-labelledby="browse-experiences-title"
          >
            <div className="container-custom">

              <div className="home-browse-heading">
                <h2 id="browse-experiences-title">
                  {t('home.browseExperiences')}
                </h2>

                <Link
                  to="/food-experiences"
                  className="home-view-all-link"
                >
                  {t('home.viewAllExperiences')}{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {foodExperiences.length > 0 ? (
                <div className="home-listing-grid home-experience-grid">
                  {foodExperiences.map((experience) => (
                    <ListingCard
                      key={experience.id}
                      item={experience}
                      type="experience"
                      language={language}
                    />
                  ))}
                </div>
              ) : (
                <p className="home-listings-empty">
                  {t('home.noExperiences')}
                </p>
              )}

            </div>
          </section>

          {!hasListings && (
            <p className="home-listings-empty">
              {t('home.noListings')}
            </p>
          )}

        </>
      )}

    </main>
  );
}

export default Home;
