
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Fetch Admin Dashboard Statistics
  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await API.get('admin/dashboard/');

        if (!cancelled) {
          setDashboard(response.data);
        }

      } catch (err) {
        console.error('Error fetching Admin Dashboard:', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unable to load the Admin Dashboard. Please try again.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };

  }, [navigate, retryCount]);

  // Main dashboard statistics
  const statistics = dashboard
    ? [
        {
          label: 'Total Users',
          value: dashboard.total_users,
          icon: '♙',
          description: 'Registered platform users',
        },
        {
          label: 'Total Tourists',
          value: dashboard.total_tourists,
          icon: '♧',
          description: 'Registered tourists',
        },
        {
          label: 'Total Vendors',
          value: dashboard.total_vendors,
          icon: '▣',
          description: 'Registered food providers',
        },
        {
          label: 'Total Tour Operators',
          value: dashboard.total_tour_operators,
          icon: '⌂',
          description: 'Registered tour operators',
        },
        {
          label: 'Food Experiences',
          value: dashboard.total_food_experiences,
          icon: '✦',
          description: 'Total food experiences',
        },
        {
          label: 'Food Tours',
          value: dashboard.total_food_tours,
          icon: '◎',
          description: 'Total food tours',
        },
        {
          label: 'Total Bookings',
          value: dashboard.total_bookings,
          icon: '▤',
          description: 'All booking requests',
        },
        {
          label: 'Total Reviews',
          value: dashboard.total_reviews,
          icon: '☆',
          description: 'Tourist reviews submitted',
        },
      ]
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-container">
          <div className="admin-dashboard-error">
            <h2>Unable to Load Dashboard</h2>
            <p>{error}</p>

            <button
              type="button"
              className="admin-dashboard-primary-btn"
              onClick={() => setRetryCount((previous) => previous + 1)}
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

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        {/* Dashboard Header */}
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-eyebrow">
              TASTELOCAL ADMINISTRATION
            </span>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor platform activity, manage providers and
              oversee bookings.
            </p>
          </div>

          <div className="admin-dashboard-welcome">
            <span>ADMIN PORTAL</span>
            <strong>Platform Overview</strong>
          </div>
        </header>


        {/* Main Statistics */}
        <section className="admin-dashboard-stats">

          {statistics.map((statistic) => (
            <div
              className="admin-dashboard-stat-card"
              key={statistic.label}
            >
              <div className="admin-dashboard-stat-icon">
                {statistic.icon}
              </div>

              <p>{statistic.label}</p>

              <h2>
                {Number(statistic.value ?? 0).toLocaleString()}
              </h2>

              <span>{statistic.description}</span>
            </div>
          ))}

        </section>


        {/* Provider Approval Overview */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              PROVIDER MANAGEMENT
            </span>

            <h2>Provider Approval Overview</h2>

            <p>
              Monitor vendor and tour operator registration statuses.
            </p>
          </div>

          <div className="admin-dashboard-overview-grid">

            {/* Vendor Status */}
            <div className="admin-dashboard-panel">

              <div className="admin-dashboard-panel-heading">
                <div className="admin-dashboard-panel-icon">
                  ▣
                </div>

                <div>
                  <h3>Vendors</h3>
                  <p>Vendor account applications</p>
                </div>
              </div>

              <div className="admin-dashboard-status-list">

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot pending"></span>
                    Pending
                  </span>

                  <strong>
                    {dashboard.pending_vendors ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot approved"></span>
                    Approved
                  </span>

                  <strong>
                    {dashboard.approved_vendors ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot rejected"></span>
                    Rejected
                  </span>

                  <strong>
                    {dashboard.rejected_vendors ?? 0}
                  </strong>
                </div>

              </div>

            </div>


            {/* Tour Operator Status */}
            <div className="admin-dashboard-panel">

              <div className="admin-dashboard-panel-heading">
                <div className="admin-dashboard-panel-icon">
                  ⌂
                </div>

                <div>
                  <h3>Tour Operators</h3>
                  <p>Tour operator applications</p>
                </div>
              </div>

              <div className="admin-dashboard-status-list">

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot pending"></span>
                    Pending
                  </span>

                  <strong>
                    {dashboard.pending_tour_operators ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot approved"></span>
                    Approved
                  </span>

                  <strong>
                    {dashboard.approved_tour_operators ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot rejected"></span>
                    Rejected
                  </span>

                  <strong>
                    {dashboard.rejected_tour_operators ?? 0}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* Booking Overview */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              BOOKING ACTIVITY
            </span>

            <h2>Booking Overview</h2>

            <p>
              Overview of booking requests across the platform.
            </p>
          </div>

          <div className="admin-dashboard-bookings">

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot pending"></span>

              <p>Pending Bookings</p>

              <strong>
                {dashboard.pending_bookings ?? 0}
              </strong>
            </div>

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot confirmed"></span>

              <p>Confirmed Bookings</p>

              <strong>
                {dashboard.confirmed_bookings ?? 0}
              </strong>
            </div>

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot rejected"></span>

              <p>Rejected Bookings</p>

              <strong>
                {dashboard.rejected_bookings ?? 0}
              </strong>
            </div>

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot cancelled"></span>

              <p>Cancelled Bookings</p>

              <strong>
                {dashboard.cancelled_bookings ?? 0}
              </strong>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default AdminDashboard;