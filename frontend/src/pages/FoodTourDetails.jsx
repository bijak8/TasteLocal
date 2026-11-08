
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function FoodTourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [stops, setStops] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Unable to load food tour details.');
      })
      .finally(() => {
        setLoading(false);
      });

    fetchReviews();
  }, [id]);

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
        setFavouriteMessage('Removed from your favourites.');
      } else {
        const response = await API.post('favourites/', {
          food_tour: Number(id),
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

  // Add food tour to itinerary
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
          food_experience: null,
          food_tour: Number(id),
          position: 1,
          notes: ''
        }
      );

      setItineraryMessage(
        'Food tour successfully added to your itinerary!'
      );

      setSelectedItinerary('');
    } catch (error) {
      console.error('Error adding food tour:', error);

      const data = error.response?.data;
      let message = 'Unable to add this food tour to your itinerary.';

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
        food_experience: null,
        food_tour: Number(id),
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
            Loading food tour details...
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
            {error}
          </div>
          <Link to="/food-tours" className="experience-back-link">
            ← Back to Food Tours
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
            Food tour not found.
          </div>
          <Link to="/food-tours" className="experience-back-link">
            ← Back to Food Tours
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
          ← Back to Food Tours
        </Link>

        {/* Tour Header */}
        <header className="food-tour-detail-header">
          <span className="home-eyebrow">
            GUIDED CULINARY JOURNEY
          </span>

          <h1>{tour.title}</h1>

          <p>{tour.description}</p>
        </header>

        {/* Main Tour Information */}
        <div className="food-tour-detail-layout">

          <div className="food-tour-detail-main">

            {/* Tour Information */}
            <section className="detail-section">
              <h2>Tour Information</h2>

              <div className="detail-information-grid">

                <div className="detail-information-item">
                  <span>Location</span>
                  <strong>
                    {tour.area || tour.city || 'Not specified'}
                  </strong>
                </div>

                <div className="detail-information-item">
                  <span>City</span>
                  <strong>{tour.city || 'Not specified'}</strong>
                </div>

                <div className="detail-information-item">
                  <span>Date</span>
                  <strong>{tour.date || 'Not specified'}</strong>
                </div>

                <div className="detail-information-item">
                  <span>Time</span>
                  <strong>
                    {tour.start_time} – {tour.end_time}
                  </strong>
                </div>

                <div className="detail-information-item">
                  <span>Capacity</span>
                  <strong>
                    {tour.capacity} participants
                  </strong>
                </div>

                <div className="detail-information-item">
                  <span>Tour Price</span>
                  <strong>SGD {tour.price}</strong>
                </div>

              </div>
            </section>

            {/* Tour Itinerary */}
            <section className="detail-section">
              <h2>Tour Itinerary</h2>

              <p className="detail-section-description">
                Discover the places included in this guided food tour.
              </p>

              {stops.length === 0 ? (
                <p className="detail-muted-text">
                  No tour stops have been added yet.
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
                          STOP {index + 1}
                        </span>

                        <h3>{stop.name}</h3>

                        <p>{stop.description}</p>

                        <div className="food-tour-stop-address">
                          <strong>Address:</strong> {stop.address}
                        </div>
                      </div>
                    </article>
                  ))}

                </div>
              )}
            </section>

            {/* Tour Map */}
            <section className="detail-section">
              <h2>Explore Tour Locations</h2>

              <p className="detail-section-description">
                View the locations included in this food tour.
              </p>

              {mappedStops.length === 0 ? (
                <div className="detail-feedback-message">
                  Map locations are not available for these tour stops yet.
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
                            Stop {index + 1}: {stop.name}
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

            {/* Ratings and Reviews */}
            <section className="detail-section food-tour-reviews">
              <h2>Ratings & Reviews</h2>

              {reviews.length === 0 ? (
                <p className="detail-muted-text">
                  No reviews yet. Be the first to share your experience!
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
    <strong>Tour Operator's Response</strong>

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
                    </article>
                  ))}

                </div>
              )}
            </section>

            {/* Submit Review */}
            <section className="experience-write-review">
              <h2>Write a Review</h2>

              <p className="detail-section-description">
                Only tourists with a confirmed booking can submit a rating and review.
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
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label className="review-form-label">
                  Your Review
                </label>

                <textarea
                  rows="4"
                  placeholder="Share your food tour experience..."
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
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>

              </form>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="food-tour-detail-sidebar">

            {/* Booking Panel */}
            <section className="booking-panel">

              <span className="booking-panel-label">
                TOUR PRICE
              </span>

              <h2>SGD {tour.price}</h2>

              <p>Per participant</p>

              <Link
                to={`/booking?food_tour=${tour.id}`}
                className="experience-book-btn"
              >
                Book This Tour
              </Link>

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

            </section>

            {/* Add to Itinerary */}
            <section className="booking-panel food-tour-itinerary-panel">

              <h2>Add to My Itinerary</h2>

              <p>
                Save this food tour to one of your personal food itineraries.
              </p>

              {itineraries.length === 0 ? (
                <div>
                  <p className="detail-muted-text">
                    No itineraries found. Create one first.
                  </p>

                  <Link
                    to="/my-itineraries"
                    className="experience-favourite-btn"
                  >
                    View My Itineraries
                  </Link>
                </div>
              ) : (
                <div className="itinerary-form">

                  <label htmlFor="food-tour-itinerary">
                    Select an Itinerary
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
                      Choose an itinerary
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
                    className="experience-book-btn"
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

          </aside>

        </div>
      </div>
    </div>
  );
}

export default FoodTourDetails;
