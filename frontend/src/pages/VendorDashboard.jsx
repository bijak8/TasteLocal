
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function VendorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, experiencesResponse] =
          await Promise.all([
            API.get('vendor/dashboard/'),
            API.get('vendor/food-experiences/')
          ]);

        setDashboard(dashboardResponse.data);

        setExperiences(
          experiencesResponse.data.results ||
          experiencesResponse.data
        );
      } catch (error) {
        console.error('Error fetching vendor dashboard:', error);

        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        setError(
          error.response?.data?.detail ||
          'Unable to load your vendor dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  // Delete Food Experience
  const handleDeleteExperience = async (experienceId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this food experience? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await API.delete(`vendor/food-experiences/${experienceId}/`);

      setExperiences((previousExperiences) =>
        previousExperiences.filter(
          (experience) => experience.id !== experienceId
        )
      );

      // Refresh dashboard statistics
      const response = await API.get('vendor/dashboard/');
      setDashboard(response.data);

      alert('Food experience deleted successfully!');
    } catch (error) {
      console.error('Error deleting food experience:', error);

      alert(
        error.response?.data?.detail ||
        'Unable to delete food experience. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="vendor-dashboard-loading">
        <div className="vendor-dashboard-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-dashboard-page">
        <div className="vendor-dashboard-container">
          <div className="vendor-dashboard-error">
            <p>{error}</p>
            <button
              type="button"
              className="vendor-dashboard-primary-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const isApproved = dashboard.vendor_status === 'approved';

  const statistics = [
    {
      label: 'Total Food Experiences',
      value: dashboard.total_experiences,
      icon: '✦',
    },
    {
      label: 'Upcoming Experiences',
      value: dashboard.upcoming_experiences,
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
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">

        {/* Dashboard Header */}
        <div className="vendor-dashboard-header">
          <div>
            <span className="vendor-dashboard-eyebrow">
              FOOD EXPERIENCE PROVIDER
            </span>

            <h1>Welcome, {dashboard.business_name}</h1>

            <p>
              Manage your food experiences, bookings and business activities.
            </p>
          </div>

          <Link
            to="/vendor/create-experience"
            className="vendor-dashboard-primary-btn"
          >
            + Create Food Experience
          </Link>
        </div>

        {/* Vendor Approval Status */}
        <section className="vendor-dashboard-approval">
          <div>
            <span className="vendor-dashboard-section-label">
              ACCOUNT STATUS
            </span>

            <h2>Business Approval Status</h2>

            <p>
              {isApproved
                ? 'Your vendor account is approved. You can create and manage food experiences.'
                : 'Your vendor account must be approved before you can create food experiences.'}
            </p>
          </div>

          <span
            className={`vendor-dashboard-status ${
              isApproved
                ? 'vendor-status-approved'
                : dashboard.vendor_status === 'rejected'
                ? 'vendor-status-rejected'
                : 'vendor-status-pending'
            }`}
          >
            {dashboard.vendor_status?.toUpperCase()}
          </span>
        </section>

        {/* Dashboard Statistics */}
        <section className="vendor-dashboard-stats">
          {statistics.map((statistic) => (
            <div
              className="vendor-dashboard-stat-card"
              key={statistic.label}
            >
              <div className="vendor-dashboard-stat-icon">
                {statistic.icon}
              </div>

              <p>{statistic.label}</p>

              <h2>{statistic.value ?? 0}</h2>
            </div>
          ))}
        </section>

        {/* Booking Overview */}
        <section className="vendor-dashboard-bookings">
          <div className="vendor-dashboard-card-heading">
            <div>
              <span className="vendor-dashboard-section-label">
                BOOKING ACTIVITY
              </span>

              <h2>Booking Overview</h2>
            </div>

            <Link
              to="/provider/bookings"
              className="vendor-dashboard-text-link"
            >
              View Bookings →
            </Link>
          </div>

          <div className="vendor-dashboard-booking-stats">

            <div>
              <span className="vendor-booking-dot confirmed"></span>
              <p>Confirmed Bookings</p>
              <strong>{dashboard.confirmed_bookings ?? 0}</strong>
            </div>

            <div>
              <span className="vendor-booking-dot pending"></span>
              <p>Pending Bookings</p>
              <strong>{dashboard.pending_bookings ?? 0}</strong>
            </div>

          </div>
        </section>

        {/* My Food Experiences */}
        <section className="vendor-dashboard-experiences">

          <div className="vendor-dashboard-card-heading">
            <div>
              <span className="vendor-dashboard-section-label">
                YOUR EXPERIENCES
              </span>

              <h2>My Food Experiences</h2>

              <p>
                View and manage the culinary experiences you have created.
              </p>
            </div>

            <Link
              to="/vendor/create-experience"
              className="vendor-dashboard-primary-btn"
            >
              + Add New Experience
            </Link>
          </div>

          {experiences.length === 0 ? (
            <div className="vendor-dashboard-empty">
              <div className="vendor-dashboard-empty-icon">✦</div>

              <h3>No Food Experiences Yet</h3>

              <p>
                You have not created any food experiences yet.
                Start by sharing your first culinary experience.
              </p>

              <Link
                to="/vendor/create-experience"
                className="vendor-dashboard-primary-btn"
              >
                Create Your First Experience
              </Link>
            </div>
          ) : (
            <div className="vendor-dashboard-table-wrapper">

              <table className="vendor-dashboard-table">

                <thead>
                  <tr>
                    <th>Experience</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {experiences.map((experience) => (
                    <tr key={experience.id}>

                      <td>
                        <strong>{experience.title}</strong>
                      </td>

                      <td>{experience.date}</td>

                      <td>SGD {experience.price}</td>

                      <td>
                        <span
                          className={`vendor-dashboard-status ${
                            experience.status === 'approved'
                              ? 'vendor-status-approved'
                              : experience.status === 'rejected'
                              ? 'vendor-status-rejected'
                              : 'vendor-status-pending'
                          }`}
                        >
                          {experience.status}
                        </span>
                      </td>

                      <td>
                        <div className="vendor-dashboard-actions">

                          <Link
                            to={`/food-experiences/${experience.id}`}
                            className="vendor-action-btn"
                          >
                            View
                          </Link>

                          <Link
                            to={`/vendor/food-experiences/${experience.id}/edit`}
                            className="vendor-action-btn vendor-action-edit"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="vendor-action-btn vendor-action-delete"
                            onClick={() =>
                              handleDeleteExperience(experience.id)
                            }
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

export default VendorDashboard;
