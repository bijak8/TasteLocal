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
      <div className="container py-5 text-center">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const displayName =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ') || profile.username;

  return (
    <div className="container py-5">

      {/* Welcome */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold">
                Welcome back, {displayName}!
              </h2>
              <p className="text-muted mb-0">
                Manage your food adventures and travel plans in one place.
              </p>
              <p className="text-muted small mt-2 mb-0">
                {profile.email}
              </p>
            </div>

            <Link
              to="/tourist/profile"
              className="btn btn-outline-primary"
            >
              Edit My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Bookings</p>
              <h3 className="fw-bold">{statistics.bookings}</h3>
              <Link to="/my-bookings">View My Bookings</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">My Favourites</p>
              <h3 className="fw-bold">{statistics.favourites}</h3>
              <Link to="/my-favourites">View My Favourites</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">My Itineraries</p>
              <h3 className="fw-bold">{statistics.itineraries}</h3>
              <Link to="/my-itineraries">View My Itineraries</Link>
            </div>
          </div>
        </div>

      </div>

      {/* Account Management */}
      <h4 className="fw-bold mb-3">My Account</h4>

      <div className="row g-3 mb-5">

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold">Profile Management</h5>
              <p className="text-muted">
                Update your personal information and account details.
              </p>
              <Link to="/tourist/profile" className="btn btn-outline-primary">
                Manage Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold">My Bookings</h5>
              <p className="text-muted">
                View your booking history and booking statuses.
              </p>
              <Link to="/my-bookings" className="btn btn-outline-primary">
                Manage Bookings
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold">My Favourites</h5>
              <p className="text-muted">
                Access your saved food experiences and food tours.
              </p>
              <Link to="/my-favourites" className="btn btn-outline-primary">
                View Favourites
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold">My Itineraries</h5>
              <p className="text-muted">
                Organise your favourite food destinations into travel plans.
              </p>
              <Link to="/my-itineraries" className="btn btn-outline-primary">
                Manage Itineraries
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Reviews */}
      <h4 className="fw-bold mb-3">My Reviews</h4>

      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="fw-bold">Share Your Food Experiences</h5>
          <p className="text-muted">
            Manage your ratings and feedback for food experiences and food tours.
          </p>
          <Link to="/my-reviews" className="btn btn-outline-primary">
            View My Reviews
          </Link>
        </div>
      </div>

      {/* Explore */}
      <h4 className="fw-bold mb-3">Discover Something New</h4>

      <div className="row g-3">

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold">Explore Food Experiences</h5>
              <p className="text-muted">
                Discover authentic local food activities and culinary experiences.
              </p>
              <Link to="/food-experiences" className="btn btn-primary">
                Explore Experiences
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold">Explore Food Tours</h5>
              <p className="text-muted">
                Discover organised food tours and multiple destinations.
              </p>
              <Link to="/food-tours" className="btn btn-primary">
                Explore Food Tours
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default TouristDashboard;
