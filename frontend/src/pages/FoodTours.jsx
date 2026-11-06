
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function FoodTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [search, setSearch] = useState('');
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
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold">Explore Food Tours</h1>
        <p className="text-secondary">
          Discover local food destinations through guided multi-stop food tours.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">

          <h5 className="fw-bold mb-3">Find Your Food Tour</h5>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by tour name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label fw-semibold">City</label>
              <select
                className="form-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Area</label>
              <select
                className="form-select"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Minimum Price (SGD)
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Maximum Price (SGD)
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

          </div>

          <button
            type="button"
            className="btn btn-outline-secondary mt-3"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>
      </div>

      {loading && (
        <p className="text-center">Loading food tours...</p>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && (
        <>
          <p className="text-secondary mb-4">
            Showing {filteredTours.length} of {tours.length} food tours
          </p>

          {filteredTours.length === 0 ? (
            <p className="text-center">
              No matching food tours found. Try changing your filters.
            </p>
          ) : (
            <div className="row g-4">
              {filteredTours.map((tour) => (
                <div className="col-md-6 col-lg-4" key={tour.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">
                        {tour.title}
                      </h5>

                      <p className="card-text text-secondary">
                        {tour.description}
                      </p>

                      <p className="mb-1">
                        <strong>Location:</strong>{' '}
                        {tour.area || tour.city || 'Location not specified'}
                      </p>

                      <p className="mb-1">
                        <strong>Date:</strong> {tour.date}
                      </p>

                      <p className="mb-1">
                        <strong>Time:</strong> {tour.start_time} – {tour.end_time}
                      </p>

                      <p className="mb-3">
                        <strong>Price:</strong> SGD {tour.price}
                      </p>

                      <Link
                        to={`/food-tours/${tour.id}`}
                        className="btn btn-dark w-100"
                      >
                        View Tour Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default FoodTours;
