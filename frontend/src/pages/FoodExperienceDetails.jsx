
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import FoodMap from '../components/FoodMap';

function FoodExperienceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [experience, setExperience] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Availability session states
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Itinerary states
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState('');
  const [itineraryMessage, setItineraryMessage] = useState('');
  const [addingToItinerary, setAddingToItinerary] = useState(false);

  // Favourite states
  const [favourite, setFavourite] = useState(null);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [favouriteMessage, setFavouriteMessage] = useState('');

  // Fetch food experience details
  useEffect(() => {
    API.get(`food-experiences/${id}/`)
      .then((response) => {
        setExperience(response.data);
      })
      .catch((error) => {
        console.error('Error fetching food experience:', error);
        setError('Unable to load food experience details.');
      })
      .finally(() => {
        setLoading(false);
      });

    fetchReviews();
  }, [id]);

  // Fetch availability sessions
  useEffect(() => {
    let cancelled = false;

    setSessionsLoading(true);
    setSessionsError('');
    setSelectedSession('');

    API.get(`food-experiences/${id}/availability/`)
      .then((response) => {
        if (cancelled) return;

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setSessions(data);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error('Error fetching availability sessions:', error);
        setSessionsError('Unable to load available sessions.');
      })
      .finally(() => {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Format session date
  const formatSessionDate = (date) => {
    if (!date) return 'Date unavailable';

    const [year, month, day] = date.split('-').map(Number);

    const sessionDate = new Date(year, month - 1, day);

    return sessionDate.toLocaleDateString('en-SG', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  // Format session time
  const formatSessionTime = (time) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Fetch reviews
  const fetchReviews = () => {
    API.get(`reviews/?food_experience=${id}`)
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
        (item) => Number(item.food_experience) === Number(id)
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
        setFavouriteMessage('Removed from your favourites.');
      } else {
        const response = await API.post('favourites/', {
          food_experience: Number(id),
        });

        setFavourite(response.data);
        setFavouriteMessage('Added to your favourites!');
      }
    } catch (error) {
      console.error('Error updating favourite:', error);

      const data = error.response?.data;
      let message = 'Unable to update your favourites. Please try again.';

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

  // Add food experience to itinerary
  const handleAddToItinerary = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedItinerary) {
      setItineraryMessage('Please select an itinerary first.');
      return;
    }

    try {
      setAddingToItinerary(true);
      setItineraryMessage('');

      await API.post(
        `itineraries/${selectedItinerary}/items/`,
        {
          food_experience: Number(id),
          position: 1,
          notes: ''
        }
      );

      setItineraryMessage(
        'Food experience successfully added to your itinerary!'
      );

      setSelectedItinerary('');
    } catch (error) {
      console.error('Error adding food experience:', error);

      const data = error.response?.data;
      let message = 'Unable to add this food experience to your itinerary.';

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

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      setReviewMessage('Please write a review before submitting.');
      return;
    }

    setSubmitting(true);
    setReviewMessage('');

    try {
      await API.post('reviews/create/', {
        food_experience: Number(id),
        food_tour: null,
        rating,
        comment,
      });

      setReviewMessage('Thank you! Your review has been submitted.');
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);

      const data = error.response?.data;
      let message = 'Unable to submit your review. Please try again.';

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

  // Navigate to booking with selected availability session
  const handleBookExperience = () => {
    if (!selectedSession) {
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    navigate(
      `/booking?food_experience=${experience.id}&availability_session=${selectedSession}`
    );
  };

  if (loading) {
    return (
      <div className="experience-details-message">
        Loading food experience...
      </div>
    );
  }

  if (error) {
    return (
      <div className="experience-details-message experience-details-error">
        {error}
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="experience-details-message">
        Food experience not found.
      </div>
    );
  }

  return (
    <div className="experience-details-page">

      <div className="container-custom experience-details-container">

        {/* Back Navigation */}
        <Link
          to="/food-experiences"
          className="experience-back-link"
        >
          ← Back to Food Experiences
        </Link>

        {/* Experience Header */}
        <section className="experience-detail-header">

          <span className="experience-category">
            {experience.category}
          </span>

          <h1>{experience.title}</h1>

          <p>{experience.description}</p>

        </section>

        {/* Main Experience Information */}
        <div className="experience-detail-layout">

          <div className="experience-detail-main">

            {/* Experience Information */}
            <section className="detail-section">

              <h2>About This Experience</h2>

              <div className="detail-information-grid">

                <div className="detail-information-item">
                  <span>Address</span>
                  <strong>{experience.address || 'Not specified'}</strong>
                </div>

                <div className="detail-information-item">
                  <span>Area</span>
                  <strong>{experience.area || 'Not specified'}</strong>
                </div>

                <div className="detail-information-item">
                  <span>City</span>
                  <strong>{experience.city || 'Not specified'}</strong>
                </div>

                <div className="detail-information-item">
                  <span>Vendor</span>
<strong>
  {experience.vendor_business_name || 'Not specified'}
</strong>
                </div>

              </div>

            </section>

            {/* Location Map */}
            <section className="detail-section">

              <h2>Location</h2>

              <p className="detail-section-description">
                Find out where this food experience takes place.
              </p>

              <div className="experience-detail-map">
                <FoodMap
                  latitude={experience.latitude}
                  longitude={experience.longitude}
                  title={experience.title}
                  address={experience.address}
                />
              </div>

            </section>

            {/* Add to Itinerary */}
            <section className="detail-section itinerary-section">

              <h2>Add to My Itinerary</h2>

              <p className="detail-section-description">
                Save this food experience to one of your personal
                food itineraries.
              </p>

              {itineraries.length === 0 ? (
                <div>
                  <p className="detail-muted-text">
                    No itineraries found. Create one first.
                  </p>

                  <Link
                    to="/my-itineraries"
                    className="taste-btn-secondary"
                  >
                    View My Itineraries
                  </Link>
                </div>
              ) : (
                <div className="itinerary-form">

                  <label htmlFor="select-itinerary">
                    Select an Itinerary
                  </label>

                  <select
                    id="select-itinerary"
                    value={selectedItinerary}
                    onChange={(e) => {
                      setSelectedItinerary(e.target.value);
                      setItineraryMessage('');
                    }}
                  >
                    <option value="">Choose an itinerary</option>

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
                      ? 'Adding...'
                      : 'Add to Itinerary'}
                  </button>

                </div>
              )}

              {itineraryMessage && (
                <div className="detail-feedback-message">
                  {itineraryMessage}
                </div>
              )}

            </section>

          </div>

          {/* Booking and Favourite Panel */}
          <aside className="experience-detail-sidebar">

            <div className="booking-panel">

              <span className="booking-panel-label">
                EXPERIENCE PRICE
              </span>

              <h2>SGD {experience.price}</h2>

              <p>Per participant</p>

              {/* Availability Sessions */}
              <div className="experience-availability">

                <h3>Choose Date and Time</h3>

                {sessionsLoading ? (
                  <p className="detail-muted-text">
                    Loading available sessions...
                  </p>
                ) : sessionsError ? (
                  <p className="detail-feedback-message">
                    {sessionsError}
                  </p>
                ) : sessions.length === 0 ? (
                  <p className="detail-muted-text">
                    No upcoming sessions are currently available.
                  </p>
                ) : (
                  <div className="experience-session-grid">

                    {sessions.map((session) => {
                      const remainingSeats = Number(
                        session.remaining_seats ?? 0
                      );

                      const isFullyBooked = remainingSeats <= 0;

                      const isSelected =
                        String(selectedSession) === String(session.id);

                      return (
                        <button
                          key={session.id}
                          type="button"
                          className={`experience-session-card ${
                            isSelected ? 'selected' : ''
                          } ${
                            isFullyBooked ? 'fully-booked' : ''
                          }`}
                          disabled={isFullyBooked}
                          onClick={() => setSelectedSession(String(session.id))}
                          aria-pressed={isSelected}
                        >

                          <strong>
                            {formatSessionDate(session.date)}
                          </strong>

<span className="experience-session-time">
  {formatSessionTime(session.start_time)} till{' '}
  {formatSessionTime(session.end_time)}
</span>

                          <span className="experience-session-seats">
                            {isFullyBooked
                              ? 'Fully booked'
                              : `${remainingSeats} left`}
                          </span>

                        </button>
                      );
                    })}

                  </div>
                )}

                {selectedSession && (
                  <p className="experience-session-selection">
                    <span>Selected session:</span>{' '}
                    {(() => {
                      const selected = sessions.find(
                        (session) =>
                          String(session.id) === String(selectedSession)
                      );

                      return selected
                        ? `${formatSessionDate(selected.date)}, ${formatSessionTime(selected.start_time)} – ${formatSessionTime(selected.end_time)}`
                        : '';
                    })()}
                  </p>
                )}

              </div>

              <button
                type="button"
                className="experience-book-btn"
                onClick={handleBookExperience}
                disabled={
                  !selectedSession ||
                  sessionsLoading ||
                  sessions.length === 0
                }
              >
                Book This Experience
              </button>

              <button
                type="button"
                className={`experience-favourite-btn ${
                  favourite ? 'is-favourite' : ''
                }`}
                onClick={handleToggleFavourite}
                disabled={favouriteLoading}
              >
                {favouriteLoading
                  ? 'Please wait...'
                  : favourite
                    ? '♥ Remove from Favourites'
                    : '♡ Add to Favourites'}
              </button>

              {favouriteMessage && (
                <div className="detail-feedback-message">
                  {favouriteMessage}
                </div>
              )}

            </div>

          </aside>

        </div>

        {/* Reviews Section */}
        <section className="experience-reviews-section">

          <div className="detail-section">

            <h2>Ratings & Reviews</h2>

            {reviews.length === 0 ? (
              <p className="detail-muted-text">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div className="experience-reviews-list">

                {reviews.map((review) => (
                  <div
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
                        <strong>Vendor's Response</strong>

                        <p>{review.provider_response}</p>

                        {review.provider_responded_at && (
                          <small>
                            Responded on{' '}
                            {new Date(
                              review.provider_responded_at
                            ).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

        </section>

        {/* Submit Review */}
        <section className="experience-write-review">

          <h2>Write a Review</h2>

          <p className="detail-section-description">
            Only tourists with a confirmed booking can submit a
            rating and review.
          </p>

          <form onSubmit={handleSubmitReview}>

            <label className="review-form-label">
              Your Rating
            </label>

            <div className="review-rating-selector">

              {[1, 2, 3, 4, 5].map((number) => (
                <button
                  key={number}
                  type="button"
                  className={number <= rating ? 'active' : ''}
                  onClick={() => setRating(number)}
                  aria-label={`Rate ${number} out of 5`}
                  aria-pressed={rating === number}
                >
                  ★
                </button>
              ))}

            </div>

            <label
              htmlFor="review-comment"
              className="review-form-label"
            >
              Your Review
            </label>

            <textarea
              id="review-comment"
              rows="4"
              placeholder="Share your experience..."
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
              className="taste-btn-primary review-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>

          </form>

        </section>

      </div>
    </div>
  );
}

export default FoodExperienceDetails;
