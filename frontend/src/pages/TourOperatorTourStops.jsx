import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

function TourOperatorTourStops() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

    try {
      await API.delete(`operator/tour-stops/${stopId}/`);

      setStops((previousStops) =>
        previousStops.filter((stop) => stop.id !== stopId)
      );

      alert('Tour stop deleted successfully!');
    } catch (err) {
      console.error('Error deleting tour stop:', err);

      alert(
        err.response?.data?.detail ||
        'Unable to delete tour stop. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        Loading tour stops...
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold">Tour Stop Management</h2>
          <p className="text-muted mb-0">
            Manage the destinations included in your food tours.
          </p>
        </div>

        <Link
          to="/operator/dashboard"
          className="btn btn-outline-secondary"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchStops}
          >
            Retry
          </button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label fw-bold">
            Filter by Food Tour ID
          </label>

          <div className="d-flex gap-2">
            <input
              type="number"
              min="1"
              className="form-control"
              placeholder="Enter food tour ID"
              value={selectedTourId}
              onChange={(event) => setSelectedTourId(event.target.value)}
            />

            <button
              className="btn btn-outline-primary"
              onClick={() => setSelectedTourId('')}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Tour Stops ({stops.length})
            </h5>
          </div>

          {stops.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">
                No tour stops found.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Order</th>
                    <th>Stop Name</th>
                    <th>Food Tour</th>
                    <th>Location</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {stops.map((stop) => (
                    <tr key={stop.id}>
                      <td>
                        <span className="badge bg-primary">
                          {stop.stop_order}
                        </span>
                      </td>

                      <td>
                        <strong>{stop.name}</strong>
                      </td>

                      <td>
                        {stop.food_tour_title || `Tour #${stop.food_tour}`}
                      </td>

                      <td>
                        {[stop.area, stop.city]
                          .filter(Boolean)
                          .join(', ') || 'Not specified'}
                      </td>

                      <td>{stop.address}</td>

                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/operator/tour-stops/${stop.id}/edit`}
                            className="btn btn-outline-warning btn-sm"
                          >
                            Edit
                          </Link>

                          <button
                            className="btn btn-outline-danger btn-sm"
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
