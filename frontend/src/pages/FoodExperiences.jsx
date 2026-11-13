
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

function FoodExperiences() {
  const { t, i18n } = useTranslation();

  const language = i18n.resolvedLanguage?.startsWith('bm')
    ? 'bm'
    : 'en';

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Availability sessions for each food experience
  const [availabilityByExperience, setAvailabilityByExperience] =
    useState({});

  // Search and filter states
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch food experiences and their availability sessions
  useEffect(() => {
    let cancelled = false;

    const fetchExperiences = async () => {
      try {
        const response = await API.get('food-experiences/');

        const experienceData = Array.isArray(response.data)
          ? response.data
          : response.data.results ?? [];

        if (cancelled) return;

        setExperiences(experienceData);

        // Fetch availability sessions for every experience
        const availabilityResults = await Promise.all(
          experienceData.map(async (experience) => {
            try {
              const availabilityResponse = await API.get(
                `food-experiences/${experience.id}/availability/`
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
                experience.id,
                {
                  earliest: upcomingSessions[0] ?? null,
                  count: upcomingSessions.length,
                },
              ];
            } catch (availabilityError) {
              console.error(
                `Error fetching availability for experience ${experience.id}:`,
                availabilityError
              );

              return [
                experience.id,
                {
                  earliest: null,
                  count: 0,
                },
              ];
            }
          })
        );

        if (!cancelled) {
          setAvailabilityByExperience(
            Object.fromEntries(availabilityResults)
          );
        }
      } catch (fetchError) {
        console.error('Error fetching food experiences:', fetchError);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchExperiences();

    return () => {
      cancelled = true;
    };
  }, []);

  // Get unique filter options
  const cities = [
    ...new Set(
      experiences.map((item) => item.city).filter(Boolean)
    ),
  ];

  const areas = [
    ...new Set(
      experiences.map((item) => item.area).filter(Boolean)
    ),
  ];

  const categories = [
    ...new Set(
      experiences.map((item) => item.category).filter(Boolean)
    ),
  ];

  // Apply search and filters
  const filteredExperiences = experiences.filter((experience) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      experience.title?.toLowerCase().includes(searchText) ||
      experience.description?.toLowerCase().includes(searchText) ||
      experience.category?.toLowerCase().includes(searchText);

    const matchesCity =
      !selectedCity || experience.city === selectedCity;

    const matchesArea =
      !selectedArea || experience.area === selectedArea;

    const matchesCategory =
      !selectedCategory || experience.category === selectedCategory;

    const price = Number(experience.price);

    const matchesMinPrice =
      minPrice === '' || price >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === '' || price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCity &&
      matchesArea &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCity('');
    setSelectedArea('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="experiences-page">

      {/* Page Heading */}
      <section className="experiences-hero">
        <div className="container-custom">
          <span className="home-eyebrow">
            {t('foodExperiences.eyebrow')}
          </span>

          <h1>{t('foodExperiences.title')}</h1>

          <p>{t('foodExperiences.subtitle')}</p>
        </div>
      </section>

      <div className="container-custom experiences-content">

        {/* Search and Filters */}
        <section className="experiences-filter-panel">

          <div className="filter-heading">
            <div>
              <h2>{t('foodExperiences.findTitle')}</h2>
              <p>{t('foodExperiences.findDescription')}</p>
            </div>
          </div>

          <div className="experience-search">
            <label htmlFor="experience-search">
              {t('foodExperiences.searchLabel')}
            </label>

            <input
              id="experience-search"
              type="text"
              placeholder={t('foodExperiences.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="experience-filter-grid">

            <div className="experience-filter-field">
              <label htmlFor="filter-city">
                {t('foodExperiences.city')}
              </label>

              <select
                id="filter-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">
                  {t('foodExperiences.allCities')}
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-area">
                {t('foodExperiences.area')}
              </label>

              <select
                id="filter-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">
                  {t('foodExperiences.allAreas')}
                </option>

                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-category">
                {t('foodExperiences.foodCategory')}
              </label>

              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">
                  {t('foodExperiences.allCategories')}
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-min-price">
                {t('foodExperiences.minimumPrice')}
              </label>

              <input
                id="filter-min-price"
                type="number"
                min="0"
                placeholder={t('foodExperiences.minimumPricePlaceholder')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-max-price">
                {t('foodExperiences.maximumPrice')}
              </label>

              <input
                id="filter-max-price"
                type="number"
                min="0"
                placeholder={t('foodExperiences.maximumPricePlaceholder')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="filter-clear-btn"
              onClick={clearFilters}
            >
              {t('foodExperiences.clearAllFilters')}
            </button>
          </div>

        </section>

        {/* Loading */}
        {loading && (
          <div className="experiences-message">
            <p>{t('foodExperiences.loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="experiences-error">
            {t('foodExperiences.error')}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <section className="experiences-results">

            <div className="experiences-results-heading">
              <div>
                <span className="home-eyebrow">
                  {t('foodExperiences.resultsEyebrow')}
                </span>

                <h2>{t('foodExperiences.availableTitle')}</h2>
              </div>

              <p>
                {t('foodExperiences.showing')}{' '}
                <strong>{filteredExperiences.length}</strong>{' '}
                {t('foodExperiences.of')}{' '}
                <strong>{experiences.length}</strong>{' '}
                {t('foodExperiences.experiences')}
              </p>
            </div>

            {filteredExperiences.length === 0 ? (
              <div className="experiences-empty">
                <h3>{t('foodExperiences.noResults')}</h3>
                <p>{t('foodExperiences.noResultsDescription')}</p>

                <button
                  type="button"
                  className="taste-btn-primary"
                  onClick={clearFilters}
                >
                  {t('foodExperiences.clearFilters')}
                </button>
              </div>
            ) : (

              <div className="experiences-grid">

                {filteredExperiences.map((experience) => {
                  const availability =
                    availabilityByExperience[experience.id];

                  return (
                    <article
                      className="experience-card"
                      key={experience.id}
                    >

                      {/* Cover Image and Category Overlay */}
                      <div className="experience-card-image-wrapper">

                        {experience.image ? (
                          <img
                            src={experience.image}
                            alt={experience.title}
                            className="experience-card-image"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="experience-card-image-placeholder">
                            {t('foodExperiences.imagePlaceholder')}
                          </div>
                        )}

                        {experience.category && (
                          <span className="experience-category-badge">
                            {experience.category}
                          </span>
                        )}

                      </div>

                      {/* Existing Card Content */}
                      <div className="experience-card-content">

                        <h3>{experience.title}</h3>

                        <p className="experience-description">
                          {experience.description}
                        </p>

                        <div className="experience-details">

                          <p>
                            <span>{t('foodExperiences.location')}</span>
                            {experience.area ||
                              experience.city ||
                              t('foodExperiences.notSpecified')}
                          </p>

                          <p>
                            <span>
                              {t('foodExperiences.earliestSession')}
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
                                  : t('foodExperiences.noUpcomingSessions')}
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
                                  {t('foodExperiences.upcomingSessions')}
                                </small>
                              )}
                            </span>
                          </p>

                          <p>
                            <span>{t('foodExperiences.price')}</span>
                            <strong>
                              SGD {experience.price}
                            </strong>
                          </p>

                        </div>

                        <Link
                          to={`/food-experiences/${experience.id}`}
                          className="experience-details-btn"
                        >
                          {t('foodExperiences.viewDetails')} →
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

export default FoodExperiences;
