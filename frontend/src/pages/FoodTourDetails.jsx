
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function FoodTourDetails() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('bm') ? 'bm' : 'en';
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [stops, setStops] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Availability session states
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(false);

  // Itinerary states
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState('');
  const [itineraryMessage, setItineraryMessage] = useState('');
  const [addingToItinerary, setAddingToItinerary] = useState(false);

  // Favourite states
  const [favourite, setFavourite] = useState(null);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [favouriteMessage, setFavouriteMessage] = useState('');

  // Fetch food tour and stops
  useEffect(() => {
    Promise.all([
      API.get(`food-tours/${id}/`),
      API.get(`food-tours/${id}/stops/`)
    ])
      .then(([tourResponse, stopsResponse]) => {
        setTour(tourResponse.data);
        setStops(stopsResponse.data);
      })
      .catch((error) => {
        console.error('Error fetching food tour:', error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });

    fetchReviews();
  }, [id]);

  // Fetch availability sessions
  useEffect(() => {
    let cancelled = false;

    const fetchSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(false);

      try {
        const response = await API.get(
          `food-tours/${id}/availability/`
        );

        if (cancelled) return;

        const sessionData = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setSessions(sessionData);
      } catch (error) {
        if (cancelled) return;

        console.error('Error fetching food tour sessions:', error);
        setSessionsError(true);
      } finally {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    };

    fetchSessions();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Format session date
  const formatSessionDate = (date) => {
    if (!date) return '';

    const [year, month, day] = date.split('-');

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString(language === 'bm' ? 'ms-MY' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format session time
  const formatSessionTime = (time) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString(language === 'bm' ? 'ms-MY' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch reviews
  const fetchReviews = () => {
    API.get(`reviews/?food_tour=${id}`)
      .then((response) => {
        setReviews(response.data.results || response.data);
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error);
      });
  };

  // Fetch tourist itineraries
  const fetchItineraries = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {
      const response = await API.get('itineraries/');
      setItineraries(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  // Fetch current favourite
  const fetchFavourite = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setFavourite(null);
      return;
    }

    try {
      const response = await API.get('favourites/');
      const favourites = response.data.results || response.data;

      const existingFavourite = favourites.find(
        (item) => Number(item.food_tour) === Number(id)
      );

      setFavourite(existingFavourite || null);
    } catch (error) {
      console.error('Error fetching favourites:', error);
    }
  };

  useEffect(() => {
    fetchFavourite();
  }, [id]);

  // Add or remove favourite
  const handleToggleFavourite = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    setFavouriteLoading(true);
    setFavouriteMessage('');

    try {
      if (favourite) {
        await API.delete(`favourites/${favourite.id}/`);
        setFavourite(null);
        setFavouriteMessage(t('tourDetails.removedFavouriteMessage'));
      } else {
        const response = await API.post('favourites/', {
          food_tour: Number(id),
        });

        setFavourite(response.data);
        setFavouriteMessage(t('tourDetails.addedFavouriteMessage'));
      }
    } catch (error) {
      console.error('Error updating favourite:', error);

      const data = error.response?.data;
      let message = t('tourDetails.favouriteError');

      if (data?.detail) {
        message = data.detail;
      } else if (data?.non_field_errors) {
        message = data.non_field_errors.join(' ');
      } else if (data && typeof data === 'object') {
        message = Object.values(data).flat().join(' ');
      }

      setFavouriteMessage(message);
    } finally {
      setFavouriteLoading(false);
    }
  };

  // Add food tour to itinerary
  const handleAddToItinerary = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedItinerary) {
      setItineraryMessage(t('tourDetails.selectItineraryFirst'));
      return;
    }

    try {
      setAddingToItinerary(true);
      setItineraryMessage('');

      await API.post(
        `itineraries/${selectedItinerary}/items/`,
        {
          food_experience: null,
          food_tour: Number(id),
          position: 1,
          notes: ''
        }
      );

      setItineraryMessage(
        t('tourDetails.itinerarySuccess')
      );

      setSelectedItinerary('');
    } catch (error) {
      console.error('Error adding food tour:', error);

      const data = error.response?.data;
      let message = t('tourDetails.itineraryError');

      if (data?.detail) {
        message = data.detail;
      } else if (data?.non_field_errors) {
        message = data.non_field_errors.join(' ');
      } else if (data && typeof data === 'object') {
        message = Object.values(data).flat().join(' ');
      }

      setItineraryMessage(message);
    } finally {
      setAddingToItinerary(false);
    }
  };

  // Navigate to booking with selected session
  const handleBookTour = () => {
    if (!selectedSession) {
      return;
    }

    navigate(
      `/booking?food_tour=${tour.id}&availability_session=${selectedSession}`
    );
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      setReviewMessage(t('tourDetails.reviewRequired'));
      return;
    }

    setSubmitting(true);
    setReviewMessage('');

    try {
      await API.post('reviews/create/', {
        food_experience: null,
        food_tour: Number(id),
        rating,
        comment,
      });

      setReviewMessage(t('tourDetails.reviewSuccess'));
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);

      const data = error.response?.data;
      let message = t('tourDetails.reviewError');

      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.non_field_errors) {
          message = data.non_field_errors.join(' ');
        } else {
          message = Object.values(data).flat().join(' ');
        }
      }

      setReviewMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Only include stops that have valid coordinates.
  const mappedStops = stops.filter(
    (stop) =>
      stop.latitude !== null &&
      stop.latitude !== undefined &&
      stop.longitude !== null &&
      stop.longitude !== undefined &&
      Number.isFinite(Number(stop.latitude)) &&
      Number.isFinite(Number(stop.longitude))
  );

  // Loading state
  if (loading) {
    return (
      <div className="food-tour-details-page">
        <div className="food-tour-details-container container-custom">
          <div className="food-tour-details-message">
            {t('tourDetails.loading')}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="food-tour-details-page">
        <div className="food-tour-details-container container-custom">
          <div className="food-tour-details-message food-tour-details-error">
            {t('tourDetails.loadError')}
          </div>
          <Link to="/food-tours" className="experience-back-link">
            ← {t('tourDetails.backToTours')}
          </Link>
        </div>
      </div>
    );
  }

  // Tour not found
  if (!tour) {
    return (
      <div className="food-tour-details-page">
        <div className="food-tour-details-container container-custom">
          <div className="food-tour-details-message">
            {t('tourDetails.notFound')}
          </div>
          <Link to="/food-tours" className="experience-back-link">
            ← {t('tourDetails.backToTours')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="food-tour-details-page">
      <div className="container-custom food-tour-details-container">

        {/* Back Link */}
        <Link to="/food-tours" className="experience-back-link">
          ← {t('tourDetails.backToTours')}
        </Link>

        {/* Full Width Tour Image with Category Badge */}
        <div className="experience-detail-image-wrapper">

          {tour.image ? (
            <img
              src={tour.image}
              alt={tour.title}
              className="experience-detail-image"
            />
          ) : (
            <div className="experience-detail-image-placeholder">
              Food Tour
            </div>
          )}

          {(tour.tour_category_name || tour.category) && (
            <span className="experience-detail-category-badge">
              {tour.tour_category_name || tour.category}
            </span>
          )}

        </div>

        {/* Tour Header */}
        <header className="food-tour-detail-header">
          <h1>{tour.title}</h1>
          <p>{tour.description}</p>
        </header>

        {/* Main Information */}
        <div className="food-tour-detail-layout">

          <div className="food-tour-detail-main">

            {/* Tour Information */}
            <section className="detail-section">
              <h2>{t('tourDetails.information')}</h2>

              <div className="detail-information-grid">

                <div className="detail-information-item">
                  <span>{t('tourDetails.location')}</span>
                  <strong>
                    {tour.area || tour.city || t('tourDetails.notSpecified')}
                  </strong>
                </div>

                <div className="detail-information-item">
                  <span>{t('tourDetails.city')}</span>
                  <strong>
                    {tour.city || t('tourDetails.notSpecified')}
                  </strong>
                </div>

                <div className="detail-information-item">
                  <span>{t('tourDetails.tourPrice')}</span>
                  <strong>SGD {tour.price}</strong>
                </div>

                <div className="detail-information-item">
                  <span>{t('tourDetails.operator')}</span>
                  <strong>
                    {tour.tour_operator_business_name || t('tourDetails.notSpecified')}
                  </strong>
                </div>

              </div>
            </section>

            {/* Tour Itinerary / Stops */}
            <section className="detail-section">
              <h2>{t('tourDetails.itinerary')}</h2>

              <p className="detail-section-description">
                {t('tourDetails.itineraryDescription')}
              </p>

              {stops.length === 0 ? (
                <p className="detail-muted-text">
                  {t('tourDetails.noStops')}
                </p>
              ) : (
                <div className="food-tour-stops-list">

                  {stops.map((stop, index) => (
                    <article
                      className="food-tour-stop-card"
                      key={stop.id}
                    >
                      <div className="food-tour-stop-number">
                        {index + 1}
                      </div>

                      <div className="food-tour-stop-content">
                        <span className="food-tour-stop-label">
                          {t('tourDetails.stop')} {index + 1}
                        </span>

                        <h3>{stop.name}</h3>

                        <p>{stop.description}</p>

                        <div className="food-tour-stop-address">
                          <strong>{t('tourDetails.address')}:</strong> {stop.address}
                        </div>
                      </div>
                    </article>
                  ))}

                </div>
              )}
            </section>

            {/* Tour Map */}
            <section className="detail-section">
              <h2>{t('tourDetails.exploreLocations')}</h2>

              <p className="detail-section-description">
                {t('tourDetails.mapDescription')}
              </p>

              {mappedStops.length === 0 ? (
                <div className="detail-feedback-message">
                  {t('tourDetails.mapUnavailable')}
                </div>
              ) : (
                <div className="food-tour-detail-map">

                  <MapContainer
                    center={[
                      Number(mappedStops[0].latitude),
                      Number(mappedStops[0].longitude)
                    ]}
                    zoom={14}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {mappedStops.map((stop, index) => (
                      <Marker
                        key={stop.id}
                        position={[
                          Number(stop.latitude),
                          Number(stop.longitude)
                        ]}
                      >
                        <Popup>
                          <strong>
                            {t('tourDetails.stop')} {index + 1}: {stop.name}
                          </strong>
                          <br />
                          {stop.address}
                        </Popup>
                      </Marker>
                    ))}

                  </MapContainer>

                </div>
              )}
            </section>

            {/* Add to Itinerary - Below the Map */}
            <section className="detail-section food-tour-itinerary-panel">

              <h2>{t('tourDetails.addToItinerary')}</h2>

              <p className="detail-section-description">
                {t('tourDetails.saveItineraryDescription')}
              </p>

              {itineraries.length === 0 ? (
                <div>
                  <p className="detail-muted-text">
                    {t('tourDetails.noItineraries')}
                  </p>

                  <Link
                    to="/my-itineraries"
                    className="taste-btn-secondary"
                  >
                    {t('tourDetails.viewItineraries')}
                  </Link>
                </div>
              ) : (
                <div className="itinerary-form">

                  <label htmlFor="food-tour-itinerary">
                    {t('tourDetails.selectItinerary')}
                  </label>

                  <select
                    id="food-tour-itinerary"
                    value={selectedItinerary}
                    onChange={(e) => {
                      setSelectedItinerary(e.target.value);
                      setItineraryMessage('');
                    }}
                  >
                    <option value="">
                      {t('tourDetails.chooseItinerary')}
                    </option>

                    {itineraries.map((itinerary) => (
                      <option
                        key={itinerary.id}
                        value={itinerary.id}
                      >
                        {itinerary.title}
                      </option>
                    ))}

                  </select>

                  <button
                    type="button"
                    className="taste-btn-primary"
                    onClick={handleAddToItinerary}
                    disabled={addingToItinerary || !selectedItinerary}
                  >
                    {addingToItinerary
                      ? t('tourDetails.adding')
                      : t('tourDetails.addToItineraryButton')}
                  </button>

                </div>
              )}

              {itineraryMessage && (
                <div className="detail-feedback-message">
                  {itineraryMessage}
                </div>
              )}

            </section>

            {/* Ratings and Reviews */}
            <section className="detail-section food-tour-reviews">
              <h2>{t('tourDetails.reviews')}</h2>

              {reviews.length === 0 ? (
                <p className="detail-muted-text">
                  {t('tourDetails.noReviews')}
                </p>
              ) : (
                <div className="experience-reviews-list">

                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="experience-review-card"
                    >
                      <div className="review-stars">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>

                      <p>{review.comment}</p>

                      <small>
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString()
                          : ''}
                      </small>

                      {review.provider_response && (
                        <div className="public-review-provider-response">
                          <strong>{t('tourDetails.operator')}'s Response</strong>

                          <p>{review.provider_response}</p>

                          {review.provider_responded_at && (
                            <small>
                              {t('tourDetails.respondedOn')}{' '}
                              {new Date(
                                review.provider_responded_at
                              ).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      )}
                    </article>
                  ))}

                </div>
              )}
            </section>

            {/* Write Review */}
            <section className="experience-write-review">
              <h2>{t('tourDetails.writeReview')}</h2>

              <p className="detail-section-description">
                {t('tourDetails.reviewEligibility')}
              </p>

              <form onSubmit={handleSubmitReview}>

                <label className="review-form-label">
                  {t('tourDetails.yourRating')}
                </label>

                <div className="review-rating-selector">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <button
                      key={number}
                      type="button"
                      className={number <= rating ? 'active' : ''}
                      onClick={() => setRating(number)}
                      aria-label={t('tourDetails.rateOutOfFive', { number })}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label className="review-form-label">
                  {t('tourDetails.yourReview')}
                </label>

                <textarea
                  rows="4"
                  placeholder={t('tourDetails.reviewPlaceholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />

                {reviewMessage && (
                  <div className="detail-feedback-message">
                    {reviewMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="experience-book-btn review-submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? t('tourDetails.submitting')
                    : t('tourDetails.submitReview')}
                </button>

              </form>
            </section>

          </div>

          {/* Booking Sidebar */}
          <aside className="food-tour-detail-sidebar">

            <section className="booking-panel">

              <span className="booking-panel-label">
                {t('tourDetails.tourPriceLabel')}
              </span>

              <h2>SGD {tour.price}</h2>

              <p>{t('tourDetails.perParticipant')}</p>

              {/* Availability Sessions */}
              <div className="experience-availability">
                <h3>{t('tourDetails.selectSession')}</h3>

                {sessionsLoading ? (
                  <p className="detail-muted-text">
                    {t('tourDetails.loadingSessions')}
                  </p>
                ) : sessionsError ? (
                  <p className="detail-muted-text">
                    {t('tourDetails.sessionsError')}
                  </p>
                ) : sessions.length === 0 ? (
                  <p className="detail-muted-text">
                    {t('tourDetails.noSessions')}
                  </p>
                ) : (
                  <div className="experience-session-grid">

                    {sessions.map((session) => {
                      const fullyBooked =
                        Number(session.remaining_seats) <= 0;

                      return (
                        <button
                          key={session.id}
                          type="button"
                          className={`experience-session-card ${
                            selectedSession === String(session.id)
                              ? 'selected'
                              : ''
                          } ${
                            fullyBooked ? 'fully-booked' : ''
                          }`}
                          onClick={() =>
                            setSelectedSession(String(session.id))
                          }
                          disabled={fullyBooked}
                        >
                          <strong>
                            {formatSessionDate(session.date)}
                          </strong>

                          <span className="experience-session-time">
                            {formatSessionTime(session.start_time)} till{' '}
                            {formatSessionTime(session.end_time)}
                          </span>

                          <span className="experience-session-seats">
                            {fullyBooked
                              ? t('tourDetails.fullyBooked')
                              : `${session.remaining_seats} ${t('tourDetails.seatsLeft')}`}
                          </span>
                        </button>
                      );
                    })}

                  </div>
                )}

                {selectedSession && (
                  <div className="experience-session-selection">
                    <span>{t('tourDetails.selectedSession')}:</span>{' '}
                    {(() => {
                      const session = sessions.find(
                        (item) => String(item.id) === selectedSession
                      );

                      return session
                        ? `${formatSessionDate(session.date)}, ${formatSessionTime(session.start_time)} ${t('tourDetails.till')} ${formatSessionTime(session.end_time)}`
                        : '';
                    })()}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="experience-book-btn"
                onClick={handleBookTour}
                disabled={
                  !selectedSession ||
                  sessionsLoading ||
                  !!sessionsError
                }
              >
                {t('tourDetails.bookTour')}
              </button>

              {/* Favourite Button */}
              <button
                type="button"
                className={`experience-favourite-btn ${
                  favourite ? 'is-favourite' : ''
                }`}
                onClick={handleToggleFavourite}
                disabled={favouriteLoading}
              >
                {favouriteLoading
                  ? t('tourDetails.pleaseWait')
                  : favourite
                    ? t('tourDetails.removeFavourite')
                    : t('tourDetails.addFavourite')}
              </button>

              {favouriteMessage && (
                <div className="detail-feedback-message">
                  {favouriteMessage}
                </div>
              )}

            </section>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default FoodTourDetails;
