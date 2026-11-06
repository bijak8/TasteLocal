
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
      <div className="operator-dashboard-loading">
        <div className="operator-dashboard-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="operator-dashboard-page">
        <div className="operator-dashboard-container">
          <div className="operator-dashboard-error">
            <p>{error}</p>
            <button
              className="operator-dashboard-primary-btn"
              onClick={fetchDashboard}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const isApproved = dashboard.operator_status === 'approved';

  const statistics = [
    {
      label: 'Total Food Tours',
      value: dashboard.total_tours,
      icon: '✦',
    },
    {
      label: 'Upcoming Tours',
      value: dashboard.upcoming_tours,
      icon: '◷',
    },
    {
      label: 'Total Bookings',
      value: dashboard.total_bookings,
      icon: '♧',
    },
    {
      label: 'Pending Bookings',
      value: dashboard.pending_bookings,
      icon: '◌',
    },
  ];

  return (
    <div className="operator-dashboard-page">
      <div className="operator-dashboard-container">

        {/* Dashboard Header */}
        <div className="operator-dashboard-header">
          <div>
            <span className="operator-dashboard-eyebrow">
              TOUR OPERATOR PORTAL
            </span>

            <h1>Welcome, {dashboard.business_name}</h1>

            <p>
              Manage your food tours, destinations and bookings from one place.
            </p>
          </div>

          <div className="operator-dashboard-header-actions">
            <Link
              to="/operator/tour-stops"
              className="operator-dashboard-secondary-btn"
            >
              Manage Tour Stops
            </Link>

            <Link
              to="/operator/create-tour"
              className="operator-dashboard-primary-btn"
            >
              + Create Food Tour
            </Link>
          </div>
        </div>

        {/* Account Approval Status */}
        <section className="operator-dashboard-approval">
          <div>
            <span className="operator-dashboard-section-label">
              ACCOUNT STATUS
            </span>

            <h2>Account Approval Status</h2>

            <p>
              {isApproved
                ? 'Your operator account is approved. You can create and manage food tours.'
                : 'Your account must be approved before you can create food tours.'}
            </p>
          </div>

          <span
            className={`operator-dashboard-status ${
              isApproved
                ? 'operator-status-approved'
                : dashboard.operator_status === 'rejected'
                ? 'operator-status-rejected'
                : 'operator-status-pending'
            }`}
          >
            {dashboard.operator_status?.toUpperCase()}
          </span>
        </section>

        {/* Dashboard Statistics */}
        <section className="operator-dashboard-stats">
          {statistics.map((statistic) => (
            <div
              className="operator-dashboard-stat-card"
              key={statistic.label}
            >
              <div className="operator-dashboard-stat-icon">
                {statistic.icon}
              </div>

              <p>{statistic.label}</p>

              <h2>{statistic.value ?? 0}</h2>
            </div>
          ))}
        </section>

        {/* Booking Overview */}
        <section className="operator-dashboard-bookings">
          <div className="operator-dashboard-card-heading">
            <div>
              <span className="operator-dashboard-section-label">
                BOOKING ACTIVITY
              </span>
              <h2>Booking Overview</h2>
            </div>

            <Link
              to="/provider/bookings"
              className="operator-dashboard-text-link"
            >
              View Bookings →
            </Link>
          </div>

          <div className="operator-dashboard-booking-stats">
            <div>
              <span className="operator-booking-dot confirmed"></span>
              <p>Confirmed Bookings</p>
              <strong>{dashboard.confirmed_bookings ?? 0}</strong>
            </div>

            <div>
              <span className="operator-booking-dot pending"></span>
              <p>Pending Bookings</p>
              <strong>{dashboard.pending_bookings ?? 0}</strong>
            </div>
          </div>
        </section>

        {/* Food Tours */}
        <section className="operator-dashboard-tours">
          <div className="operator-dashboard-card-heading">
            <div>
              <span className="operator-dashboard-section-label">
                YOUR EXPERIENCES
              </span>
              <h2>My Food Tours</h2>
              <p>View and manage the food tours you have created.</p>
            </div>

            <Link
              to="/operator/create-tour"
              className="operator-dashboard-primary-btn"
            >
              + Add New Tour
            </Link>
          </div>

          {tours.length === 0 ? (
            <div className="operator-dashboard-empty">
              <div className="operator-dashboard-empty-icon">✦</div>
              <h3>No Food Tours Yet</h3>
              <p>
                You have not created any food tours yet. Start by creating
                your first culinary experience.
              </p>

              <Link
                to="/operator/create-tour"
                className="operator-dashboard-primary-btn"
              >
                Create Your First Food Tour
              </Link>
            </div>
          ) : (
            <div className="operator-dashboard-table-wrapper">
              <table className="operator-dashboard-table">
                <thead>
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
                          className={`operator-dashboard-status ${
                            tour.status === 'approved'
                              ? 'operator-status-approved'
                              : tour.status === 'rejected'
                              ? 'operator-status-rejected'
                              : 'operator-status-pending'
                          }`}
                        >
                          {tour.status}
                        </span>
                      </td>

                      <td>
                        <div className="operator-dashboard-actions">

                          <Link
                            to={`/food-tours/${tour.id}`}
                            className="operator-action-btn"
                          >
                            View
                          </Link>

                          <Link
                            to={`/operator/add-tour-stop?tour_id=${tour.id}`}
                            className="operator-action-btn"
                          >
                            Add Stop
                          </Link>

                          <Link
                            to={`/operator/tour-stops?tour_id=${tour.id}`}
                            className="operator-action-btn"
                          >
                            Manage Stops
                          </Link>

                          <Link
                            to={`/operator/food-tours/${tour.id}/edit`}
                            className="operator-action-btn operator-action-edit"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="operator-action-btn operator-action-delete"
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
        </section>

      </div>
    </div>
  );
}

export default TourOperatorDashboard;
