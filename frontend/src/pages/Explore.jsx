import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SINGAPORE_CENTER = [1.3521, 103.8198];

function MapBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) {
      map.setView(SINGAPORE_CENTER, 11);
      return;
    }

    if (locations.length === 1) {
      map.setView(
        [Number(locations[0].latitude), Number(locations[0].longitude)],
        14
      );
      return;
    }

    const bounds = locations.map((location) => [
      Number(location.latitude),
      Number(location.longitude)
    ]);

    map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
  }, [locations, map]);

  return null;
}

function getLocationLabel(location) {
  return location.area || location.city || 'Singapore';
}

function getTypeLabel(type) {
  if (type === 'food_experience') return 'Food Experience';
  if (type === 'food_tour') return 'Food Tour';
  if (type === 'vendor') return 'Local Vendor';
  return 'Local Listing';
}

function Explore() {
  const routeLocation = useLocation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All neighbourhoods');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (routeLocation.hash === '#local-vendors') {
      setSelectedType('vendor');
    } else if (
      routeLocation.hash === '#all-listings' ||
      routeLocation.hash === ''
    ) {
      setSelectedType('all');
    }

    if (routeLocation.hash) {
      window.setTimeout(() => {
        const target = document.getElementById('explore-listings');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [routeLocation.pathname, routeLocation.hash]);

  useEffect(() => {
    let cancelled = false;

    const fetchLocations = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await API.get('explore/locations/');
        const data = response.data?.locations || [];

        if (!cancelled) {
          setLocations(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        console.error('Error fetching Explore locations:', fetchError);

        if (!cancelled) {
          setError(
            'We could not load locations right now. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  const validLocations = useMemo(() => {
    return locations.filter((location) => {
      const latitude = Number(location.latitude);
      const longitude = Number(location.longitude);

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= 1.15 &&
        latitude <= 1.48 &&
        longitude >= 103.55 &&
        longitude <= 104.1
      );
    });
  }, [locations]);

  const areas = useMemo(() => {
    return [...new Set(
      validLocations
        .map(getLocationLabel)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [validLocations]);

  const filteredLocations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return validLocations.filter((location) => {
      const matchesType =
        selectedType === 'all' || location.type === selectedType;

      const matchesArea =
        selectedArea === 'All neighbourhoods' ||
        getLocationLabel(location) === selectedArea;

      const searchableText = [
        location.title,
        location.stop_name,
        location.description,
        location.address,
        location.city,
        location.area
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch =
        !keyword || searchableText.includes(keyword);

      return matchesType && matchesArea && matchesSearch;
    });
  }, [validLocations, selectedType, selectedArea, search]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedArea('All neighbourhoods');
    setSelectedType('all');
  };

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <div className="explore-container">
          <span className="explore-eyebrow">DISCOVER LOCAL FLAVOURS</span>
          <h1>Explore Singapore</h1>
          <p>
            Find food experiences, guided food tours and local food
            businesses across Singapore.
          </p>

          <div className="explore-search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by food, place or neighbourhood..."
              aria-label="Search locations"
            />
          </div>
        </div>
      </section>

      <section className="explore-content explore-container" id="explore-listings">
        <div className="explore-section-heading">
          <div>
            <span className="explore-eyebrow">FIND YOUR NEXT STOP</span>
            <h2>Explore by location</h2>
            <p>Browse approved TasteLocal listings on the Singapore map.</p>
          </div>
          <div className="explore-total">
            <strong>{filteredLocations.length}</strong>
            <span>map locations</span>
          </div>
        </div>

        <div className="explore-filters">
          <div className="explore-type-filters" id="all-listings" aria-label="Filter listing type">
            <button
              type="button"
              className={selectedType === 'all' ? 'active' : ''}
              onClick={() => setSelectedType('all')}
            >
              All listings
            </button>
            <button
              type="button"
              className={selectedType === 'food_experience' ? 'active' : ''}
              onClick={() => setSelectedType('food_experience')}
            >
              Food Experiences
            </button>
            <button
              type="button"
              className={selectedType === 'food_tour' ? 'active' : ''}
              onClick={() => setSelectedType('food_tour')}
            >
              Food Tours
            </button>
            <button
              type="button"
              id="local-vendors"
              className={selectedType === 'vendor' ? 'active' : ''}
              onClick={() => setSelectedType('vendor')}
            >
              Local Vendors
            </button>
          </div>

          <label className="explore-area-select">
            <span>Neighbourhood</span>
            <select
              value={selectedArea}
              onChange={(event) => setSelectedArea(event.target.value)}
            >
              <option>All neighbourhoods</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="explore-clear-btn"
            onClick={handleClearFilters}
          >
            Clear filters
          </button>
        </div>

        {error && (
          <div className="explore-message explore-error">
            {error}
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="explore-message">Loading Singapore locations...</div>
        ) : (
          <>
            <div className="explore-map-shell">
              <MapContainer
                center={SINGAPORE_CENTER}
                zoom={11}
                scrollWheelZoom={false}
                className="explore-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds locations={filteredLocations} />

                {filteredLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[
                      Number(location.latitude),
                      Number(location.longitude)
                    ]}
                  >
                    <Popup>
                      <div className="explore-map-popup">
                        <strong>{location.stop_name || location.title}</strong>
                        <span>{getTypeLabel(location.type)}</span>
                        <small>
                          {location.address || getLocationLabel(location)}
                        </small>
                        {location.url && (
                          <Link to={location.url}>View listing</Link>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="explore-results-heading">
              <div>
                <h2>Places to discover</h2>
                <p>
                  {filteredLocations.length
                    ? `Showing ${filteredLocations.length} map location${filteredLocations.length === 1 ? '' : 's'}`
                    : 'No map locations match your filters.'}
                </p>
              </div>
            </div>

            {filteredLocations.length === 0 ? (
              <div className="explore-empty">
                <h3>No locations found</h3>
                <p>
                  Try another search term or clear your filters to see all
                  available locations.
                </p>
                <button type="button" onClick={handleClearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="explore-location-grid">
                {filteredLocations.map((location) => (
                  <article className="explore-location-card" key={location.id}>
                    <div className="explore-location-image-wrap">
                      {location.image ? (
                        <img
                          src={location.image}
                          alt={location.title || 'TasteLocal listing'}
                          className="explore-location-image"
                        />
                      ) : (
                        <div className="explore-location-placeholder">
                          <span>味</span>
                        </div>
                      )}

                      <span className={`explore-category-badge explore-category-${location.type}`}>
                        {getTypeLabel(location.type)}
                      </span>
                    </div>

                    <div className="explore-location-card-content">
                      <h3>{location.stop_name || location.title}</h3>
                      {location.stop_name && (
                        <p className="explore-tour-parent">
                          Part of {location.title}
                        </p>
                      )}
                      <p className="explore-location-description">
                        {location.description || 'Discover this local TasteLocal listing.'}
                      </p>
                      <div className="explore-location-address">
                        <span aria-hidden="true">⌖</span>
                        {location.address || getLocationLabel(location)}
                      </div>
                      {location.url ? (
                        <Link
                          to={location.url}
                          className="experience-details-btn"
                        >
                          View details <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <span className="explore-vendor-note">
                          Local vendor location
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Explore;
