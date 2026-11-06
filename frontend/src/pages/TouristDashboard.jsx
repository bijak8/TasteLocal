
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function TouristDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState({
    bookings: 0,
    favourites: 0,
    itineraries: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }

    fetchDashboard();
  }, [navigate]);

  const getListData = (data) => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        profileResponse,
        bookingsResponse,
        favouritesResponse,
        itinerariesResponse,
      ] = await Promise.all([
        API.get('tourist/profile/'),
        API.get('my-bookings/'),
        API.get('favourites/'),
        API.get('itineraries/'),
      ]);

      setProfile(profileResponse.data);

      setStatistics({
        bookings: getListData(bookingsResponse.data).length,
        favourites: getListData(favouritesResponse.data).length,
        itineraries: getListData(itinerariesResponse.data).length,
      });

    } catch (err) {
      console.error('Error fetching tourist dashboard:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
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

  if (loading) {
    return (
      <section className="tourist-dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tourist-dashboard-page">
        <div className="tourist-dashboard-container">
          <div className="dashboard-error" role="alert">
            {error}
          </div>

          <button
            className="dashboard-retry-btn"
            onClick={fetchDashboard}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!profile) return null;

  const displayName =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ') || profile.username;

  return (
    <section className="tourist-dashboard-page">
      <div className="tourist-dashboard-container">

        {/* Welcome section */}
        <div className="tourist-welcome-card">
          <div className="tourist-welcome-content">
            <span className="tourist-dashboard-eyebrow">
              YOUR TASTELOCAL ACCOUNT
            </span>

            <h1>Welcome back, {displayName}!</h1>

            <p>
              Manage your food adventures, saved discoveries
              and travel plans all in one place.
            </p>

            <span className="tourist-welcome-email">
              {profile.email}
            </span>
          </div>

          <Link
            to="/tourist/profile"
            className="dashboard-profile-btn"
          >
            Edit My Profile
          </Link>
        </div>

        {/* Statistics */}
        <div className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>Your Activity</h2>
            <p>A quick overview of your TasteLocal account.</p>
          </div>

          <div className="dashboard-statistics">

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">▣</div>
              <span className="dashboard-stat-label">Total Bookings</span>
              <strong>{statistics.bookings}</strong>
              <Link to="/my-bookings">View My Bookings →</Link>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">♥</div>
              <span className="dashboard-stat-label">My Favourites</span>
              <strong>{statistics.favourites}</strong>
              <Link to="/my-favourites">View My Favourites →</Link>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">✦</div>
              <span className="dashboard-stat-label">My Itineraries</span>
              <strong>{statistics.itineraries}</strong>
              <Link to="/my-itineraries">View My Itineraries →</Link>
            </article>

          </div>
        </div>

        {/* Account management */}
        <div className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>Manage Your Account</h2>
            <p>Quick access to your personal account features.</p>
          </div>

          <div className="dashboard-links-grid">

            <article className="dashboard-link-card">
              <span className="dashboard-link-icon">♙</span>
              <h3>Profile Management</h3>
              <p>
                Update your personal information and account details.
              </p>
              <Link to="/tourist/profile">Manage Profile →</Link>
            </article>

            <article className="dashboard-link-card">
              <span className="dashboard-link-icon">▣</span>
              <h3>My Bookings</h3>
              <p>
                View your booking history and booking statuses.
              </p>
              <Link to="/my-bookings">Manage Bookings →</Link>
            </article>

            <article className="dashboard-link-card">
              <span className="dashboard-link-icon">♥</span>
              <h3>My Favourites</h3>
              <p>
                Access your saved food experiences and food tours.
              </p>
              <Link to="/my-favourites">View Favourites →</Link>
            </article>

            <article className="dashboard-link-card">
              <span className="dashboard-link-icon">✦</span>
              <h3>My Itineraries</h3>
              <p>
                Organise your favourite food destinations into travel plans.
              </p>
              <Link to="/my-itineraries">Manage Itineraries →</Link>
            </article>

          </div>
        </div>

        {/* Reviews */}
        <div className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>My Reviews</h2>
            <p>Share your experiences with the TasteLocal community.</p>
          </div>

          <div className="dashboard-feature-card">
            <div>
              <span className="dashboard-link-icon">★</span>
              <h3>Share Your Food Experiences</h3>
              <p>
                Manage your ratings and feedback for food experiences
                and food tours.
              </p>
            </div>

            <Link to="/my-reviews" className="dashboard-feature-btn">
              View My Reviews
            </Link>
          </div>
        </div>

        {/* Discover */}
        <div className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>Discover Something New</h2>
            <p>Find your next memorable food adventure.</p>
          </div>

          <div className="dashboard-discover-grid">

            <article className="dashboard-discover-card">
              <div className="dashboard-discover-content">
                <span className="dashboard-discover-eyebrow">
                  EXPLORE LOCAL FLAVOURS
                </span>
                <h3>Food Experiences</h3>
                <p>
                  Discover authentic local food activities
                  and culinary experiences.
                </p>
                <Link to="/food-experiences">
                  Explore Experiences →
                </Link>
              </div>
            </article>

            <article className="dashboard-discover-card">
              <div className="dashboard-discover-content">
                <span className="dashboard-discover-eyebrow">
                  EXPLORE FOOD CULTURE
                </span>
                <h3>Food Tours</h3>
                <p>
                  Discover organised food tours and
                  multiple culinary destinations.
                </p>
                <Link to="/food-tours">
                  Explore Food Tours →
                </Link>
              </div>
            </article>

          </div>
        </div>

      </div>
    </section>
  );
}

export default TouristDashboard;
