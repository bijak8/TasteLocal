
import { useEffect, useState } from 'react';
import API from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('my-bookings/')
      .then((response) => {
        setBookings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error);
        setError('Unable to load your bookings. Please log in again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-success',
      rejected: 'bg-danger',
      cancelled: 'bg-secondary',
    };

    return (
      <span className={`badge ${styles[status] || 'bg-secondary'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-2">My Bookings</h1>

      <p className="text-secondary mb-4">
        View and track your food experience and food tour bookings.
      </p>

      {loading && <p>Loading your bookings...</p>}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="alert alert-info">
          You have not made any bookings yet.
        </div>
      )}

      <div className="row g-4">
        {bookings.map((booking) => (
          <div className="col-md-6" key={booking.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold">
                  Booking #{booking.id}
                </h5>

                <p>
                  <strong>Type:</strong>{' '}
                  {booking.food_experience
                    ? 'Food Experience'
                    : 'Food Tour'}
                </p>

                <p>
                  <strong>Reference ID:</strong>{' '}
                  {booking.food_experience || booking.food_tour}
                </p>

                <p>
                  <strong>Participants:</strong>{' '}
                  {booking.number_of_participants}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {getStatusBadge(booking.status)}
                </p>

                <p>
                  <strong>Special Request:</strong>{' '}
                  {booking.special_request || 'None'}
                </p>

                <small className="text-secondary">
                  Submitted: {new Date(booking.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
