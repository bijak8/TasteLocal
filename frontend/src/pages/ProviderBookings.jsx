
import { useEffect, useState } from 'react';
import API from '../services/api';

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    setError('');

    API.get('bookings/')
      .then((response) => {
        setBookings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching provider bookings:', error);
        setError(
          error.response?.data?.detail ||
          'Unable to load bookings. Please check your provider login.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBooking = async (bookingId, status) => {
    setUpdatingId(bookingId);
    setError('');

    try {
      await API.patch(`bookings/${bookingId}/update/`, {
        status: status,
      });

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: status }
            : booking
        )
      );
    } catch (error) {
      console.error('Error updating booking:', error);

      setError(
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        'Unable to update booking.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
      <h1 className="fw-bold mb-2">Manage Bookings</h1>

      <p className="text-secondary mb-4">
        Review and manage incoming booking requests.
      </p>

      <button
        className="btn btn-outline-dark mb-4"
        onClick={fetchBookings}
        disabled={loading}
      >
        Refresh Bookings
      </button>

      {loading && <p>Loading bookings...</p>}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="alert alert-info">
          No booking requests received yet.
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
                  <strong>Booking Type:</strong>{' '}
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
                  <strong>Special Request:</strong>{' '}
                  {booking.special_request || 'None'}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {getStatusBadge(booking.status)}
                </p>

                <small className="text-secondary">
                  Submitted: {new Date(booking.created_at).toLocaleString()}
                </small>

                {booking.status === 'pending' && (
                  <div className="d-flex gap-2 mt-4">

                    <button
                      className="btn btn-success flex-fill"
                      disabled={updatingId === booking.id}
                      onClick={() => updateBooking(booking.id, 'confirmed')}
                    >
                      {updatingId === booking.id
                        ? 'Updating...'
                        : 'Confirm'}
                    </button>

                    <button
                      className="btn btn-danger flex-fill"
                      disabled={updatingId === booking.id}
                      onClick={() => updateBooking(booking.id, 'rejected')}
                    >
                      Reject
                    </button>

                  </div>
                )}

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProviderBookings;
