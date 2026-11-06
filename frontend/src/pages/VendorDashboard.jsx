
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
      <div className="container py-5">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="container py-5">

      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>
          <h1 className="fw-bold mb-1">
            Vendor Dashboard
          </h1>

          <p className="text-secondary mb-0">
            Welcome, {dashboard.business_name}
          </p>
        </div>

        <Link
          to="/vendor/create-experience"
          className="btn btn-warning"
        >
          + Create Food Experience
        </Link>

      </div>

      {/* Vendor Approval Status */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">

          <div>
            <h6 className="fw-bold mb-1">
              Business Approval Status
            </h6>

            <small className="text-secondary">
              Your Vendor account status
            </small>
          </div>

          <span
            className={`badge ${
              dashboard.vendor_status === 'approved'
                ? 'bg-success'
                : dashboard.vendor_status === 'rejected'
                  ? 'bg-danger'
                  : 'bg-warning text-dark'
            }`}
          >
            {dashboard.vendor_status?.toUpperCase()}
          </span>

        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="row g-4 mb-5">

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">
                Total Food Experiences
              </p>

              <h2 className="fw-bold">
                {dashboard.total_experiences}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">
                Upcoming Experiences
              </p>

              <h2 className="fw-bold">
                {dashboard.upcoming_experiences}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">
                Total Bookings
              </p>

              <h2 className="fw-bold">
                {dashboard.total_bookings}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">
                Pending Bookings
              </p>

              <h2 className="fw-bold">
                {dashboard.pending_bookings}
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Summary */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">

          <h4 className="fw-bold mb-3">
            Booking Overview
          </h4>

          <div className="d-flex justify-content-between align-items-center">
            <span>Confirmed Bookings</span>

            <span className="badge bg-success fs-6">
              {dashboard.confirmed_bookings}
            </span>
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center">
            <span>Pending Bookings</span>

            <span className="badge bg-warning text-dark fs-6">
              {dashboard.pending_bookings}
            </span>
          </div>

          <Link
            to="/provider/bookings"
            className="btn btn-outline-dark mt-4"
          >
            Manage Bookings
          </Link>

        </div>
      </div>

      {/* My Food Experiences */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <h4 className="fw-bold mb-0">
          My Food Experiences
        </h4>

        <Link
          to="/vendor/create-experience"
          className="btn btn-outline-dark btn-sm"
        >
          Create New
        </Link>

      </div>

      {experiences.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">

            <h5>No food experiences yet</h5>

            <p className="text-secondary">
              Create your first food experience to attract tourists.
            </p>

            <Link
              to="/vendor/create-experience"
              className="btn btn-warning"
            >
              Create Food Experience
            </Link>

          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">

            <thead className="table-light">
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

                  <td className="fw-semibold">
                    {experience.title}
                  </td>

                  <td>{experience.date}</td>

                  <td>SGD {experience.price}</td>

                  <td>
                    <span
                      className={`badge ${
                        experience.status === 'approved'
                          ? 'bg-success'
                          : experience.status === 'rejected'
                            ? 'bg-danger'
                            : 'bg-warning text-dark'
                      }`}
                    >
                      {experience.status}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex gap-2 flex-wrap">

                      <Link
                        to={`/vendor/food-experiences/${experience.id}/edit`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Edit
                      </Link>

                      <Link
                        to={`/food-experiences/${experience.id}`}
                        className="btn btn-sm btn-outline-dark"
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
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

    </div>
  );
}

export default VendorDashboard;
