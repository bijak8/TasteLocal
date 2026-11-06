
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
    const normalizedStatus = (status || '').toLowerCase();

    const statusLabels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };

    return (
      <span className={`booking-status booking-status-${normalizedStatus}`}>
        {statusLabels[normalizedStatus] || normalizedStatus || 'Unknown'}
      </span>
    );
  };

  return (
    <section className="my-bookings-page">
      <div className="my-bookings-container">

        <div className="my-bookings-heading">
          <span className="my-bookings-eyebrow">YOUR TASTELOCAL ACCOUNT</span>
          <h1>My Bookings</h1>
          <p>
            Keep track of your food experiences and food tour booking requests.
          </p>
        </div>

        {!loading && !error && bookings.length > 0 && (
          <div className="my-bookings-summary">
            <div>
              <span className="my-bookings-summary-number">
                {bookings.length}
              </span>
              <span className="my-bookings-summary-label">
                Total Bookings
              </span>
            </div>
            <div>
              <span className="my-bookings-summary-number">
                {bookings.filter(
                  (booking) =>
                    (booking.status || '').toLowerCase() === 'pending'
                ).length}
              </span>
              <span className="my-bookings-summary-label">
                Pending Requests
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="my-bookings-message">
            <div className="my-bookings-loader"></div>
            <p>Loading your bookings...</p>
          </div>
        )}

        {error && (
          <div className="my-bookings-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="my-bookings-empty">
            <div className="my-bookings-empty-icon">✦</div>
            <h2>No Bookings Yet</h2>
            <p>
              You haven't made any bookings yet. Start exploring
              local food experiences and tours to plan your next adventure.
            </p>
            <a href="/food-experiences" className="my-bookings-explore-btn">
              Explore Food Experiences
            </a>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="my-bookings-grid">
            {bookings.map((booking) => {
              const isExperience = Boolean(booking.food_experience);
              const referenceId =
                booking.food_experience || booking.food_tour;

              return (
                <article className="my-booking-card" key={booking.id}>
                  <div className="my-booking-card-header">
                    <div>
                      <span className="my-booking-reference-label">
                        BOOKING REFERENCE
                      </span>
                      <h2>#{booking.id}</h2>
                    </div>

                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="my-booking-card-body">
                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Booking Type
                      </span>
                      <strong>
                        {isExperience ? 'Food Experience' : 'Food Tour'}
                      </strong>
                    </div>

                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Reference ID
                      </span>
                      <strong>{referenceId}</strong>
                    </div>

                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Participants
                      </span>
                      <strong>{booking.number_of_participants}</strong>
                    </div>

                    <div className="my-booking-special-request">
                      <span className="my-booking-detail-label">
                        Special Requests
                      </span>
                      <p>{booking.special_request || 'No special requests'}</p>
                    </div>
                  </div>

                  <div className="my-booking-card-footer">
                    <span>Submitted</span>
                    <time dateTime={booking.created_at}>
                      {new Date(booking.created_at).toLocaleString()}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

export default MyBookings;
