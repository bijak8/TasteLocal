
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';

// Format session date and time
const formatSessionDateTime = (session) => {
  const dateTime = new Date(
    `${session.date}T${session.start_time}`
  );

  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateTime);
};

function FoodExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (error) {
        console.error('Error fetching food experiences:', error);

        if (!cancelled) {
          setError(
            'Unable to load food experiences. Please try again.'
          );
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
  const cities = [...new Set(
    experiences.map((item) => item.city).filter(Boolean)
  )];

  const areas = [...new Set(
    experiences.map((item) => item.area).filter(Boolean)
  )];

  const categories = [...new Set(
    experiences.map((item) => item.category).filter(Boolean)
  )];

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
            TASTE SOMETHING DIFFERENT
          </span>

          <h1>Explore Food Experiences</h1>

          <p>
            Discover authentic local food activities, cooking classes,
            food tastings and unique culinary experiences.
          </p>
        </div>
      </section>

      <div className="container-custom experiences-content">

        {/* Search and Filters */}
        <section className="experiences-filter-panel">

          <div className="filter-heading">
            <div>
              <h2>Find Your Food Experience</h2>
              <p>
                Search and filter experiences to find your perfect match.
              </p>
            </div>
          </div>

          <div className="experience-search">
            <label htmlFor="experience-search">
              Search experiences
            </label>

            <input
              id="experience-search"
              type="text"
              placeholder="Search by name, description or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="experience-filter-grid">

            <div className="experience-filter-field">
              <label htmlFor="filter-city">City</label>

              <select
                id="filter-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-area">Area</label>

              <select
                id="filter-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">All Areas</option>

                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-category">
                Food Category
              </label>

              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-min-price">
                Minimum Price (SGD)
              </label>

              <input
                id="filter-min-price"
                type="number"
                min="0"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="experience-filter-field">
              <label htmlFor="filter-max-price">
                Maximum Price (SGD)
              </label>

              <input
                id="filter-max-price"
                type="number"
                min="0"
                placeholder="Maximum price"
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
              Clear All Filters
            </button>
          </div>

        </section>

        {/* Loading */}
        {loading && (
          <div className="experiences-message">
            <p>Loading food experiences...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="experiences-error">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <section className="experiences-results">

            <div className="experiences-results-heading">
              <div>
                <span className="home-eyebrow">
                  EXPLORE LOCAL FLAVOURS
                </span>

                <h2>Available Experiences</h2>
              </div>

              <p>
                Showing <strong>{filteredExperiences.length}</strong> of{' '}
                <strong>{experiences.length}</strong> experiences
              </p>
            </div>

            {filteredExperiences.length === 0 ? (
              <div className="experiences-empty">
                <h3>No matching experiences found</h3>
                <p>Try changing your search or filters.</p>

                <button
                  type="button"
                  className="taste-btn-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
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

                      <div className="experience-card-content">

                        <span className="experience-category">
                          {experience.category}
                        </span>

                        <h3>{experience.title}</h3>

                        <p className="experience-description">
                          {experience.description}
                        </p>

                        <div className="experience-details">

                          <p>
                            <span>Location</span>
                            {experience.area ||
                              experience.city ||
                              'Not specified'}
                          </p>

                          <p>
                            <span>Earliest Upcoming Session</span>

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
                                      availability.earliest
                                    )
                                  : 'No upcoming sessions available'}
                              </strong>

                              {availability?.count > 0 && (
                                <small
                                  style={{
                                    color: '#39966B',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {availability.count} upcoming sessions
                                  available
                                </small>
                              )}
                            </span>
                          </p>

                          <p>
                            <span>Price</span>
                            <strong>
                              SGD {experience.price}
                            </strong>
                          </p>

                        </div>

                        <Link
                          to={`/food-experiences/${experience.id}`}
                          className="experience-details-btn"
                        >
                          View Details →
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
