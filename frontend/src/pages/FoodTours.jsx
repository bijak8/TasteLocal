
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

function FoodTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (error) {
        console.error('Error fetching food tours:', error);

        if (!cancelled) {
          setError(
            'Unable to load food tours. Please try again.'
          );
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
  const cities = [...new Set(
    tours.map((tour) => tour.city).filter(Boolean)
  )];

  const areas = [...new Set(
    tours.map((tour) => tour.area).filter(Boolean)
  )];

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
            EXPLORE LOCAL FOOD CULTURE
          </span>

          <h1>Discover Food Tours</h1>

          <p>
            Explore local food destinations through guided,
            multi-stop culinary journeys created by local tour operators.
          </p>
        </div>
      </section>

      <div className="container-custom food-tours-content">

        {/* Search and Filters */}
        <section className="food-tours-filter-panel">

          <div className="food-tours-filter-heading">
            <h2>Find Your Food Tour</h2>
            <p>
              Search and filter tours to find your next culinary adventure.
            </p>
          </div>

          <div className="food-tour-search">
            <label htmlFor="tour-search">Search food tours</label>

            <input
              id="tour-search"
              type="text"
              placeholder="Search by tour name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="food-tour-filter-grid">

            <div className="food-tour-filter-field">
              <label htmlFor="tour-city">City</label>

              <select
                id="tour-city"
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

            <div className="food-tour-filter-field">
              <label htmlFor="tour-area">Area</label>

              <select
                id="tour-area"
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

            <div className="food-tour-filter-field">
              <label htmlFor="tour-min-price">
                Minimum Price (SGD)
              </label>

              <input
                id="tour-min-price"
                type="number"
                min="0"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="food-tour-filter-field">
              <label htmlFor="tour-max-price">
                Maximum Price (SGD)
              </label>

              <input
                id="tour-max-price"
                type="number"
                min="0"
                placeholder="Maximum price"
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
              Clear All Filters
            </button>
          </div>

        </section>

        {/* Loading */}
        {loading && (
          <div className="food-tours-message">
            Loading food tours...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="food-tours-error">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <section className="food-tours-results">

            <div className="food-tours-results-heading">

              <div>
                <span className="home-eyebrow">
                  EXPLORE CULINARY JOURNEYS
                </span>

                <h2>Available Food Tours</h2>
              </div>

              <p>
                Showing <strong>{filteredTours.length}</strong> of{' '}
                <strong>{tours.length}</strong> food tours
              </p>

            </div>

            {filteredTours.length === 0 ? (
              <div className="food-tours-empty">
                <h3>No matching food tours found</h3>

                <p>
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  className="taste-btn-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
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

                      <div className="food-tour-card-content">

                        <span className="food-tour-label">
                          GUIDED FOOD TOUR
                        </span>

                        <h3>{tour.title}</h3>

                        <p className="food-tour-description">
                          {tour.description}
                        </p>

                        <div className="food-tour-details">

                          <p>
                            <span>Location</span>
                            {tour.area || tour.city || 'Not specified'}
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
                            <strong>SGD {tour.price}</strong>
                          </p>

                        </div>

                        <Link
                          to={`/food-tours/${tour.id}`}
                          className="experience-details-btn"
                        >
                          View Tour Details →
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
