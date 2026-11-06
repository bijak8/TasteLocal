import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function TourOperatorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashboardResponse, toursResponse] = await Promise.all([
        API.get('operator/dashboard/'),
        API.get('operator/food-tours/'),
      ]);

      setDashboard(dashboardResponse.data);

      const toursData = toursResponse.data.results || toursResponse.data;
      setTours(toursData);
    } catch (err) {
      console.error('Error fetching tour operator dashboard:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.detail ||
        'Unable to load your dashboard. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete food tour
  const handleDeleteTour = async (tourId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this food tour? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await API.delete(`operator/food-tours/${tourId}/`);

      setTours((previousTours) =>
        previousTours.filter((tour) => tour.id !== tourId)
      );

      const response = await API.get('operator/dashboard/');
      setDashboard(response.data);

      alert('Food tour deleted successfully!');
    } catch (err) {
      console.error('Error deleting food tour:', err);

      alert(
        err.response?.data?.detail ||
        'Unable to delete food tour. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>

        <button className="btn btn-primary" onClick={fetchDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="container mt-4 mb-5">

      {/* Dashboard Heading and Actions */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold">Tour Operator Dashboard</h2>

          <p className="text-muted mb-0">
            Welcome, {dashboard.business_name}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">

          <Link
            to="/operator/tour-stops"
            className="btn btn-outline-primary"
          >
            Manage Tour Stops
          </Link>

          <Link
            to="/operator/create-tour"
            className="btn btn-primary"
          >
            + Create Food Tour
          </Link>

        </div>
      </div>

      {/* Operator Approval Status */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold">Account Approval Status</h5>

          <span
            className={`badge ${
              dashboard.operator_status === 'approved'
                ? 'bg-success'
                : dashboard.operator_status === 'rejected'
                ? 'bg-danger'
                : 'bg-warning text-dark'
            }`}
          >
            {dashboard.operator_status?.toUpperCase()}
          </span>

          {dashboard.operator_status !== 'approved' && (
            <p className="text-muted mt-2 mb-0">
              Your account must be approved before you can create food tours.
            </p>
          )}

        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Food Tours</p>
              <h3 className="fw-bold">{dashboard.total_tours}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Upcoming Tours</p>
              <h3 className="fw-bold">{dashboard.upcoming_tours}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Bookings</p>
              <h3 className="fw-bold">{dashboard.total_bookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Pending Bookings</p>
              <h3 className="fw-bold">{dashboard.pending_bookings}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Overview */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-3">Booking Overview</h5>

          <div className="row">

            <div className="col-md-6 mb-2">
              <span className="text-muted">Confirmed Bookings: </span>
              <strong>{dashboard.confirmed_bookings}</strong>
            </div>

            <div className="col-md-6 mb-2">
              <span className="text-muted">Pending Bookings: </span>
              <strong>{dashboard.pending_bookings}</strong>
            </div>

          </div>

          <Link
            to="/provider/bookings"
            className="btn btn-outline-primary btn-sm mt-2"
          >
            Manage Bookings
          </Link>

        </div>
      </div>

      {/* Food Tours Table */}
      <div className="card shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">

            <h5 className="fw-bold mb-0">My Food Tours</h5>

            <Link
              to="/operator/create-tour"
              className="btn btn-success btn-sm"
            >
              Add New Tour
            </Link>

          </div>

          {tours.length === 0 ? (

            <div className="text-center py-4">
              <p className="text-muted">
                You have not created any food tours yet.
              </p>

              <Link
                to="/operator/create-tour"
                className="btn btn-primary"
              >
                Create Your First Food Tour
              </Link>
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Food Tour</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {tours.map((tour) => (

                    <tr key={tour.id}>

                      <td>
                        <strong>{tour.title}</strong>
                      </td>

                      <td>
                        {tour.area ? `${tour.area}, ` : ''}
                        {tour.city || 'Not specified'}
                      </td>

                      <td>{tour.date}</td>

                      <td>{tour.price}</td>

                      <td>{tour.capacity}</td>

                      <td>
                        <span
                          className={`badge ${
                            tour.status === 'approved'
                              ? 'bg-success'
                              : tour.status === 'rejected'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {tour.status}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex flex-wrap gap-2">

                          {/* View Food Tour */}
                          <Link
                            to={`/food-tours/${tour.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View
                          </Link>

                          {/* Add Tour Stop */}
                          <Link
                            to={`/operator/add-tour-stop?tour_id=${tour.id}`}
                            className="btn btn-outline-success btn-sm"
                          >
                            Add Stop
                          </Link>

                          {/* Manage Existing Stops */}
                          <Link
                            to={`/operator/tour-stops?tour_id=${tour.id}`}
                            className="btn btn-outline-info btn-sm"
                          >
                            Manage Stops
                          </Link>

                          {/* Edit Food Tour */}
                          <Link
                            to={`/operator/food-tours/${tour.id}/edit`}
                            className="btn btn-outline-warning btn-sm"
                          >
                            Edit
                          </Link>

                          {/* Delete Food Tour */}
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteTour(tour.id)}
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

export default TourOperatorDashboard;
