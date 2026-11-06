
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

function TourOperatorTourStops() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTourId, setSelectedTourId] = useState(
    searchParams.get('tour_id') || ''
  );

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    fetchStops();
  }, [navigate, selectedTourId]);

  const fetchStops = async () => {
    try {
      setLoading(true);
      setError('');

      const url = selectedTourId
        ? `operator/tour-stops/?tour_id=${selectedTourId}`
        : 'operator/tour-stops/';

      const response = await API.get(url);
      const data = response.data.results || response.data;

      setStops(data);
    } catch (err) {
      console.error('Error fetching tour stops:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.detail ||
        'Unable to load tour stops. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (stopId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this tour stop?'
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await API.delete(`operator/tour-stops/${stopId}/`);

      setStops((previousStops) =>
        previousStops.filter((stop) => stop.id !== stopId)
      );

      setSuccess('Tour stop deleted successfully!');
    } catch (err) {
      console.error('Error deleting tour stop:', err);

      setError(
        err.response?.data?.detail ||
        'Unable to delete tour stop. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="operator-stops-page">
        <div className="operator-stops-loading">
          <div className="operator-stops-spinner" />
          <p>Loading your tour stops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-stops-page">
      <div className="operator-stops-container">

        <div className="operator-stops-heading">
          <span className="operator-stops-eyebrow">
            TOUR MANAGEMENT
          </span>

          <div className="operator-stops-heading-row">
            <div>
              <h1>Tour Stop Management</h1>
              <p>
                Manage the restaurants and destinations included
                in your food tour itineraries.
              </p>
            </div>

            <Link
              to="/operator/dashboard"
              className="operator-stops-back-btn"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="operator-stops-error">
            <span>{error}</span>
            <button onClick={fetchStops}>
              Retry
            </button>
          </div>
        )}

        {success && (
          <div className="operator-stops-success" role="status">
            <strong>Success!</strong> {success}
          </div>
        )}

        <div className="operator-stops-filter-card">
          <div className="operator-stops-filter-heading">
            <div>
              <h2>Filter Tour Stops</h2>
              <p>Find destinations belonging to a particular food tour.</p>
            </div>
            <span className="operator-stops-filter-icon">⌕</span>
          </div>

          <div className="operator-stops-filter-controls">
            <div className="operator-stops-filter-field">
              <label htmlFor="tourFilter">Food Tour ID</label>
              <input
                id="tourFilter"
                type="number"
                min="1"
                placeholder="Enter food tour ID"
                value={selectedTourId}
                onChange={(event) => setSelectedTourId(event.target.value)}
              />
            </div>

            <button
              className="operator-stops-clear-btn"
              onClick={() => setSelectedTourId('')}
              disabled={!selectedTourId}
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div className="operator-stops-list-card">
          <div className="operator-stops-list-header">
            <div>
              <h2>Your Tour Stops</h2>
              <p>Manage the destinations in your itineraries.</p>
            </div>

            <div className="operator-stops-count">
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
            </div>
          </div>

          {stops.length === 0 ? (
            <div className="operator-stops-empty">
              <div className="operator-stops-empty-icon">✦</div>
              <h3>No Tour Stops Found</h3>
              <p>
                There are currently no destinations matching your selection.
              </p>
              {selectedTourId && (
                <button
                  className="operator-stops-clear-link"
                  onClick={() => setSelectedTourId('')}
                >
                  View all tour stops
                </button>
              )}
            </div>
          ) : (
            <div className="operator-stops-table-wrapper">
              <table className="operator-stops-table">
                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>DESTINATION</th>
                    <th>FOOD TOUR</th>
                    <th>LOCATION</th>
                    <th>ADDRESS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {stops.map((stop) => (
                    <tr key={stop.id}>
                      <td>
                        <span className="operator-stops-order">
                          {stop.stop_order}
                        </span>
                      </td>

                      <td>
                        <strong className="operator-stops-name">
                          {stop.name}
                        </strong>
                      </td>

                      <td>
                        <span className="operator-stops-tour">
                          {stop.food_tour_title || `Tour #${stop.food_tour}`}
                        </span>
                      </td>

                      <td>
                        {[stop.area, stop.city]
                          .filter(Boolean)
                          .join(', ') || 'Not specified'}
                      </td>

                      <td className="operator-stops-address">
                        {stop.address}
                      </td>

                      <td>
                        <div className="operator-stops-actions">
                          <Link
                            to={`/operator/tour-stops/${stop.id}/edit`}
                            className="operator-stops-edit-btn"
                          >
                            Edit
                          </Link>

                          <button
                            className="operator-stops-delete-btn"
                            onClick={() => handleDelete(stop.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TourOperatorTourStops;
