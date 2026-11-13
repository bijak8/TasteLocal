
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

// Format session date and time
const formatSessionDateTime = (session, language) => {
  const dateTime = new Date(
    `${session.date}T${session.start_time}`
  );

  return new Intl.DateTimeFormat(
    language === 'bm' ? 'ms-MY' : 'en-SG',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(dateTime);
};

function FoodTours() {
  const { t, i18n } = useTranslation();

  const language = i18n.resolvedLanguage?.startsWith('bm')
    ? 'bm'
    : 'en';

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Availability sessions for each food tour
  const [availabilityByTour, setAvailabilityByTour] = useState({});

  // Search and filter states
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch food tours and their availability sessions
  useEffect(() => {
    let cancelled = false;

    const fetchTours = async () => {
      try {
        const response = await API.get('food-tours/');

        const tourData = Array.isArray(response.data)
          ? response.data
          : response.data.results ?? [];

        if (cancelled) return;

        setTours(tourData);

        // Fetch availability sessions for every food tour
        const availabilityResults = await Promise.all(
          tourData.map(async (tour) => {
            try {
              const availabilityResponse = await API.get(
                `food-tours/${tour.id}/availability/`
              );

              const sessions = Array.isArray(availabilityResponse.data)
                ? availabilityResponse.data
                : availabilityResponse.data.results ?? [];

              const now = new Date();

              // Keep future sessions with available seats
              const upcomingSessions = sessions
                .filter((session) => {
                  const sessionDateTime = new Date(
                    `${session.date}T${session.start_time}`
                  );

                  return (
                    !Number.isNaN(sessionDateTime.getTime()) &&
                    sessionDateTime > now &&
                    Number(session.remaining_seats) > 0
                  );
                })
                .sort((a, b) => {
                  const dateA = new Date(
                    `${a.date}T${a.start_time}`
                  );

                  const dateB = new Date(
                    `${b.date}T${b.start_time}`
                  );

                  return dateA - dateB;
                });

              return [
                tour.id,
                {
                  earliest: upcomingSessions[0] ?? null,
                  count: upcomingSessions.length,
                },
              ];
            } catch (availabilityError) {
              console.error(
                `Error fetching availability for food tour ${tour.id}:`,
                availabilityError
              );

              return [
                tour.id,
                {
                  earliest: null,
                  count: 0,
                },
              ];
            }
          })
        );

        if (!cancelled) {
          setAvailabilityByTour(
            Object.fromEntries(availabilityResults)
          );
        }
      } catch (fetchError) {
        console.error('Error fetching food tours:', fetchError);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTours();

    return () => {
      cancelled = true;
    };
  }, []);

  // Get available cities and areas
  const cities = [
    ...new Set(tours.map((tour) => tour.city).filter(Boolean)),
  ];

  const areas = [
    ...new Set(tours.map((tour) => tour.area).filter(Boolean)),
  ];

  // Apply search and filters
  const filteredTours = tours.filter((tour) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      tour.title?.toLowerCase().includes(searchText) ||
      tour.description?.toLowerCase().includes(searchText);

    const matchesCity =
      !selectedCity || tour.city === selectedCity;

    const matchesArea =
      !selectedArea || tour.area === selectedArea;

    const price = Number(tour.price);

    const matchesMinPrice =
      minPrice === '' || price >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === '' || price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCity &&
      matchesArea &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCity('');
    setSelectedArea('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="food-tours-page">

      {/* Page Heading */}
      <section className="food-tours-hero">
        <div className="container-custom">
          <span className="home-eyebrow">
            {t('foodTours.eyebrow')}
          </span>

          <h1>{t('foodTours.title')}</h1>

          <p>{t('foodTours.subtitle')}</p>
        </div>
      </section>

      <div className="container-custom food-tours-content">

        {/* Search and Filters */}
        <section className="food-tours-filter-panel">

          <div className="food-tours-filter-heading">
            <h2>{t('foodTours.findTitle')}</h2>
            <p>{t('foodTours.findDescription')}</p>
          </div>

          <div className="food-tour-search">
            <label htmlFor="tour-search">
              {t('foodTours.searchLabel')}
            </label>

            <input
              id="tour-search"
              type="text"
              placeholder={t('foodTours.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="food-tour-filter-grid">

            <div className="food-tour-filter-field">
              <label htmlFor="tour-city">
                {t('foodTours.city')}
              </label>

              <select
                id="tour-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">
                  {t('foodTours.allCities')}
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="food-tour-filter-field">
              <label htmlFor="tour-area">
                {t('foodTours.area')}
              </label>

              <select
                id="tour-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">
                  {t('foodTours.allAreas')}
                </option>

                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="food-tour-filter-field">
              <label htmlFor="tour-min-price">
                {t('foodTours.minimumPrice')}
              </label>

              <input
                id="tour-min-price"
                type="number"
                min="0"
                placeholder={t('foodTours.minimumPricePlaceholder')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="food-tour-filter-field">
              <label htmlFor="tour-max-price">
                {t('foodTours.maximumPrice')}
              </label>

              <input
                id="tour-max-price"
                type="number"
                min="0"
                placeholder={t('foodTours.maximumPricePlaceholder')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

          </div>

          <div className="food-tour-filter-actions">
            <button
              type="button"
              onClick={clearFilters}
            >
              {t('foodTours.clearAllFilters')}
            </button>
          </div>

        </section>

        {/* Loading */}
        {loading && (
          <div className="food-tours-message">
            {t('foodTours.loading')}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="food-tours-error">
            {t('foodTours.error')}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <section className="food-tours-results">

            <div className="food-tours-results-heading">

              <div>
                <span className="home-eyebrow">
                  {t('foodTours.resultsEyebrow')}
                </span>

                <h2>{t('foodTours.availableTitle')}</h2>
              </div>

              <p>
                {t('foodTours.showing')}{' '}
                <strong>{filteredTours.length}</strong>{' '}
                {t('foodTours.of')}{' '}
                <strong>{tours.length}</strong>{' '}
                {t('foodTours.tours')}
              </p>

            </div>

            {filteredTours.length === 0 ? (
              <div className="food-tours-empty">
                <h3>{t('foodTours.noResults')}</h3>

                <p>{t('foodTours.noResultsDescription')}</p>

                <button
                  type="button"
                  className="taste-btn-primary"
                  onClick={clearFilters}
                >
                  {t('foodTours.clearFilters')}
                </button>
              </div>
            ) : (

              <div className="food-tours-grid">

                {filteredTours.map((tour) => {
                  const availability =
                    availabilityByTour[tour.id];

                  return (
<article
  className="food-tour-card"
  key={tour.id}
>
  {/* Food Tour Cover Image */}
  <div className="experience-card-image-wrapper">
    {tour.image ? (
      <img
        src={tour.image}
        alt={tour.title || 'TasteLocal food tour'}
        className="experience-card-image"
      />
    ) : (
      <div className="experience-card-image-placeholder">
        <span>味</span>
      </div>
    )}

    {/* Category Badge */}
    <span className="experience-category-badge">
      {t('foodTours.guidedTour')}
    </span>
  </div>

  <div className="food-tour-card-content">



                        <h3>{tour.title}</h3>

                        <p className="food-tour-description">
                          {tour.description}
                        </p>

                        <div className="food-tour-details">

                          <p>
                            <span>{t('foodTours.location')}</span>
                            {tour.area || tour.city || t('foodTours.notSpecified')}
                          </p>

                          <p>
                            <span>
                              {t('foodTours.earliestSession')}
                            </span>

                            <span
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: '4px',
                                textAlign: 'right',
                              }}
                            >
                              <strong>
                                {availability?.earliest
                                  ? formatSessionDateTime(
                                      availability.earliest,
                                      language
                                    )
                                  : t('foodTours.noUpcomingSessions')}
                              </strong>

                              {availability?.count > 0 && (
                                <small
                                  style={{
                                    color: '#39966B',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {availability.count}{' '}
                                  {t('foodTours.upcomingSessions')}
                                </small>
                              )}
                            </span>
                          </p>

                          <p>
                            <span>{t('foodTours.price')}</span>
                            <strong>SGD {tour.price}</strong>
                          </p>

                        </div>

                        <Link
                          to={`/food-tours/${tour.id}`}
                          className="experience-details-btn"
                        >
                          {t('foodTours.viewDetails')} →
                        </Link>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </section>
        )}

      </div>
    </div>
  );
}

export default FoodTours;
