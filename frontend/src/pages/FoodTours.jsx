
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';

function FoodTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    API.get('food-tours/')
      .then((response) => {
        setTours(response.data);
      })
      .catch((error) => {
        console.error('Error fetching food tours:', error);
        setError('Unable to load food tours. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
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

                {filteredTours.map((tour) => (
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
                          <span>Date</span>
                          {tour.date || 'Not specified'}
                        </p>

                        <p>
                          <span>Time</span>
                          {tour.start_time} – {tour.end_time}
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
                ))}

              </div>
            )}

          </section>
        )}

      </div>
    </div>
  );
}

export default FoodTours;
