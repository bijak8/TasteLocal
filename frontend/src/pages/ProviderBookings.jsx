
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
        status,
      });

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status }
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

  const getStatusClass = (status) => {
    const styles = {
      pending: 'provider-status-pending',
      confirmed: 'provider-status-confirmed',
      rejected: 'provider-status-rejected',
      cancelled: 'provider-status-cancelled',
    };

    return styles[status] || 'provider-status-cancelled';
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      undefined,
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return '--';

    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') {
      return 'Not available';
    }

    return `S$${Number(price).toFixed(2)}`;
  };

  return (
    <section className="provider-bookings-page">
      <div className="provider-bookings-container">

        {/* Page heading */}
        <div className="provider-bookings-heading">
          <div>
            <span className="provider-bookings-eyebrow">
              PROVIDER MANAGEMENT
            </span>

            <h1>Manage Bookings</h1>

            <p>
              Review incoming booking requests and manage
              your customers' reservations.
            </p>
          </div>

          <button
            type="button"
            className="provider-refresh-btn"
            onClick={fetchBookings}
            disabled={loading}
          >
            ↻ {loading ? 'Refreshing...' : 'Refresh Bookings'}
          </button>
        </div>

        {/* Booking summary */}
        <div className="provider-booking-summary">

          <div className="provider-summary-card">
            <span>Total Bookings</span>
            <strong>{bookings.length}</strong>
          </div>

          <div className="provider-summary-card">
            <span>Pending</span>
            <strong>
              {bookings.filter(
                (booking) => booking.status === 'pending'
              ).length}
            </strong>
          </div>

          <div className="provider-summary-card">
            <span>Confirmed</span>
            <strong>
              {bookings.filter(
                (booking) => booking.status === 'confirmed'
              ).length}
            </strong>
          </div>

          <div className="provider-summary-card">
            <span>Rejected</span>
            <strong>
              {bookings.filter(
                (booking) => booking.status === 'rejected'
              ).length}
            </strong>
          </div>

        </div>

        {/* Error message */}
        {error && (
          <div className="provider-booking-alert" role="alert">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="provider-bookings-loading">
            <div className="provider-bookings-loader"></div>
            <p>Loading booking requests...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="provider-bookings-empty">
            <div className="provider-empty-icon">▣</div>

            <h2>No Booking Requests Yet</h2>

            <p>
              New customer bookings will appear here when
              someone reserves your food experiences or tours.
            </p>
          </div>
        )}

        {/* Booking cards */}
        {!loading && bookings.length > 0 && (
          <div className="provider-bookings-grid">

            {bookings.map((booking) => {

              const referenceId =
                booking.food_experience || booking.food_tour;

              return (
                <article
                  className="provider-booking-card"
                  key={booking.id}
                >

                  {/* Booking header */}
                  <div className="provider-booking-card-header">

                    <div>
                      <span className="provider-booking-reference">
                        BOOKING REFERENCE
                      </span>

                      <h2>#{booking.id}</h2>
                    </div>

                    <span
                      className={`provider-booking-status ${getStatusClass(booking.status)}`}
                    >
                      {booking.status}
                    </span>

                  </div>

                  {/* Booking type */}
                  <div className="provider-booking-type">
                    {booking.listing_type ||
                      (booking.food_experience
                        ? 'Food Experience'
                        : 'Food Tour')}
                  </div>

                  {/* Listing title */}
                  <h3 className="provider-booking-title">
                    {booking.listing_title ||
                      'Listing title unavailable'}
                  </h3>

                  {/* Booking details */}
                  <div className="provider-booking-details">

                    {/* Booking date */}
                    <div className="provider-booking-detail">
                      <span>Booking Date</span>

                      <strong>
                        {formatDate(booking.session_date)}
                      </strong>
                    </div>

                    {/* Session time */}
                    <div className="provider-booking-detail">
                      <span>Session Time</span>

                      <strong>
                        {formatTime(booking.session_start_time)}
                        {' - '}
                        {formatTime(booking.session_end_time)}
                      </strong>
                    </div>

                    {/* Price per participant */}
                    <div className="provider-booking-detail">
                      <span>Price per Participant</span>

                      <strong>
                        {formatPrice(
                          booking.price_per_participant
                        )}
                      </strong>
                    </div>

                    {/* Total price */}
                    <div className="provider-booking-detail">
                      <span>Total Price</span>

                      <strong>
                        {formatPrice(booking.total_price)}
                      </strong>
                    </div>

                    {/* Reference ID */}
                    <div className="provider-booking-detail">
                      <span>Reference ID</span>

                      <strong>
                        {referenceId || 'Not available'}
                      </strong>
                    </div>

                    {/* Participants */}
                    <div className="provider-booking-detail">
                      <span>Participants</span>

                      <strong>
                        {booking.number_of_participants}
                      </strong>
                    </div>

                    {/* Special request */}
                    <div className="provider-booking-detail provider-booking-request">
                      <span>Special Request</span>

                      <p>
                        {booking.special_request ||
                          'No special requests'}
                      </p>
                    </div>

                    {/* Submission date */}
                    <div className="provider-booking-detail provider-booking-submitted">
                      <span>Submitted</span>

                      <strong>
                        {booking.created_at
                          ? new Date(
                              booking.created_at
                            ).toLocaleString()
                          : 'Not available'}
                      </strong>
                    </div>

                  </div>

                  {/* Booking actions */}
                  {booking.status === 'pending' && (
                    <div className="provider-booking-actions">

                      <button
                        type="button"
                        className="provider-confirm-btn"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          updateBooking(booking.id, 'confirmed')
                        }
                      >
                        {updatingId === booking.id
                          ? 'Updating...'
                          : '✓ Confirm Booking'}
                      </button>

                      <button
                        type="button"
                        className="provider-reject-btn"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          updateBooking(booking.id, 'rejected')
                        }
                      >
                        Reject
                      </button>

                    </div>
                  )}

                  {/* Completed booking */}
                  {booking.status !== 'pending' && (
                    <div className="provider-booking-completed">
                      This booking has been {booking.status}.
                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}

export default ProviderBookings;
