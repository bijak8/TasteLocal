
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function FoodExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    API.get('food-experiences/')
      .then((response) => {
        setExperiences(response.data);
      })
      .catch((error) => {
        console.error('Error fetching food experiences:', error);
        setError('Unable to load food experiences. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Get unique filter options from available experiences
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
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold">Explore Food Experiences</h1>
        <p className="text-secondary">
          Discover authentic local food activities and culinary experiences.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">

          <h5 className="fw-bold mb-3">Find Your Food Experience</h5>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by experience name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="row g-3">

            <div className="col-md-4">
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

            <div className="col-md-4">
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

            <div className="col-md-4">
              <label className="form-label fw-semibold">Food Category</label>
              <select
                className="form-select"
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

            <div className="col-md-6">
              <label className="form-label fw-semibold">Minimum Price (SGD)</label>
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
              <label className="form-label fw-semibold">Maximum Price (SGD)</label>
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
        <p className="text-center">Loading food experiences...</p>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && (
        <>
          <p className="text-secondary mb-4">
            Showing {filteredExperiences.length} of {experiences.length} food experiences
          </p>

          {filteredExperiences.length === 0 ? (
            <p className="text-center">
              No matching food experiences found. Try changing your filters.
            </p>
          ) : (
            <div className="row g-4">
              {filteredExperiences.map((experience) => (
                <div className="col-md-6 col-lg-4" key={experience.id}>
                  <div className="card h-100 shadow-sm">

                    <div className="card-body">
                      <span className="badge bg-warning text-dark mb-3">
                        {experience.category}
                      </span>

                      <h5 className="card-title fw-bold">
                        {experience.title}
                      </h5>

                      <p className="card-text text-secondary">
                        {experience.description}
                      </p>

                      <p className="mb-1">
                        <strong>Location:</strong>{' '}
                        {experience.area || experience.city || 'Location not specified'}
                      </p>

                      <p className="mb-1">
                        <strong>Date:</strong> {experience.date}
                      </p>

                      <p className="mb-3">
                        <strong>Price:</strong> SGD {experience.price}
                      </p>

                      <Link
                        to={`/food-experiences/${experience.id}`}
                        className="btn btn-dark w-100"
                      >
                        View Details
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

export default FoodExperiences;
