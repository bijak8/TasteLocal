
import { useEffect, useState } from 'react';
import API from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('my-bookings/')
      .then((response) => {
        console.log('My Bookings API response:', response.data);

        // Support both normal and paginated API responses.
        const data = response.data;
        setBookings(Array.isArray(data) ? data : data.results || []);
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

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    // Avoid timezone shifting for date-only values.
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
      'en-SG',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') {
      return 'Not available';
    }

    const amount = Number(price);

    if (!Number.isFinite(amount)) return 'Not available';

    return amount.toFixed(2);
  };

  return (
    <section className="my-bookings-page">
      <div className="my-bookings-container">

        <div className="my-bookings-heading">
          <span className="my-bookings-eyebrow">
            YOUR TASTELOCAL ACCOUNT
          </span>

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

            <a
              href="/food-experiences"
              className="my-bookings-explore-btn"
            >
              Explore Food Experiences
            </a>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="my-bookings-grid">

            {bookings.map((booking) => {
              const isExperience = Boolean(booking.food_experience);

              const listingType =
                booking.listing_type ||
                (isExperience ? 'Food Experience' : 'Food Tour');

              const listingTitle =
                booking.listing_title || 'Listing title unavailable';

              const startTime = formatTime(booking.session_start_time);
              const endTime = formatTime(booking.session_end_time);

              return (
                <article
                  className="my-booking-card"
                  key={booking.id}
                >

                  {/* Booking Header */}
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

                    {/* Listing Details */}
                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Booking Type
                      </span>
                      <strong>{listingType}</strong>
                    </div>

                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Listing Title
                      </span>
                      <strong>{listingTitle}</strong>
                    </div>

                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Listing ID
                      </span>
                      <strong>
                        {booking.food_experience || booking.food_tour || '—'}
                      </strong>
                    </div>

                    {/* Date and Time */}
                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Booking Date
                      </span>
                      <strong>
                        {formatDate(booking.session_date)}
                      </strong>
                    </div>

                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Time
                      </span>
                      <strong>
                        {startTime || 'Time unavailable'}
                        {endTime ? ` – ${endTime}` : ''}
                      </strong>
                    </div>

                    {/* Participants */}
                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Participants
                      </span>
                      <strong>
                        {booking.number_of_participants}
                      </strong>
                    </div>

                    {/* Pricing */}
                    <div className="my-booking-detail">
                      <span className="my-booking-detail-label">
                        Price Per Participant
                      </span>
                      <strong>
                        {formatPrice(booking.price_per_participant)}
                      </strong>
                    </div>

                    <div className="my-booking-detail my-booking-total">
                      <span className="my-booking-detail-label">
                        Total Price
                      </span>
                      <strong>
                        {formatPrice(booking.total_price)}
                      </strong>
                    </div>

                    {/* Special Requests */}
                    <div className="my-booking-special-request">
                      <span className="my-booking-detail-label">
                        Special Requests
                      </span>
                      <p>
                        {booking.special_request || 'No special requests'}
                      </p>
                    </div>

                  </div>

                  {/* Listing Link */}
                  <div className="my-booking-listing-link">
                    {booking.listing_url ? (
                      <a href={booking.listing_url}>
                        View Listing →
                      </a>
                    ) : (
                      <span>Listing link unavailable</span>
                    )}
                  </div>

                  {/* Booking Footer */}
                  <div className="my-booking-card-footer">
                    <span>Submitted</span>
                    <time dateTime={booking.created_at}>
                      {booking.created_at
                        ? new Date(booking.created_at).toLocaleString()
                        : 'Unavailable'}
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
