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

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  if (error) {
    return <div className="container py-5 alert alert-danger">{error}</div>;
  }

  if (!tour) {
    return <div className="container py-5">Food tour not found.</div>;
  }

  return (
    <div className="container py-5">

      <Link to="/food-tours" className="btn btn-outline-secondary mb-4">
        ← Back to Food Tours
      </Link>

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4 p-md-5">

          <h1 className="fw-bold mb-3">{tour.title}</h1>

          <p className="text-secondary mb-4">
            {tour.description}
          </p>

          <hr />

          <h5 className="fw-bold mb-3">Tour Information</h5>

          <p>
            <strong>Location:</strong> {tour.area || tour.city || 'Not specified'}
          </p>

          <p>
            <strong>City:</strong> {tour.city || 'Not specified'}
          </p>

          <p><strong>Date:</strong> {tour.date}</p>

          <p>
            <strong>Time:</strong> {tour.start_time} – {tour.end_time}
          </p>

          <p>
            <strong>Capacity:</strong> {tour.capacity} participants
          </p>

          <h3 className="fw-bold mt-4">SGD {tour.price}</h3>

          <Link
            to={`/booking?food_tour=${tour.id}`}
            className="btn btn-warning btn-lg mt-3"
          >
            Book This Tour
          </Link>

          {/* Favourite Button */}
          <div className="mt-3">
            <button
              type="button"
              className={`btn ${
                favourite ? 'btn-danger' : 'btn-outline-danger'
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
              <div className="alert alert-info mt-3 mb-0">
                {favouriteMessage}
              </div>
            )}
          </div>

          {/* Add to Itinerary */}
          <div className="border rounded p-4 mt-4">

            <h5 className="fw-bold mb-3">
              Add to My Itinerary
            </h5>

            <p className="text-secondary">
              Save this food tour to one of your personal food itineraries.
            </p>

            {itineraries.length === 0 ? (
              <div>
                <p className="text-secondary">
                  No itineraries found. Create one first.
                </p>

                <Link
                  to="/my-itineraries"
                  className="btn btn-outline-dark"
                >
                  View My Itineraries
                </Link>
              </div>
            ) : (
              <div>
                <label className="form-label fw-bold">
                  Select an Itinerary
                </label>

                <select
                  className="form-select mb-3"
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
                  className="btn btn-dark"
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
              <div className="alert alert-info mt-3 mb-0">
                {itineraryMessage}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Tour Itinerary */}
      <h2 className="fw-bold mb-4">Tour Itinerary</h2>

      {stops.length === 0 ? (
        <p>No tour stops have been added yet.</p>
      ) : (
        <div className="list-group">
          {stops.map((stop, index) => (
            <div className="list-group-item p-4" key={stop.id}>
              <h5 className="fw-bold">
                Stop {index + 1}: {stop.name}
              </h5>

              <p className="text-secondary mb-2">
                {stop.description}
              </p>

              <p className="mb-0">
                <strong>Address:</strong> {stop.address}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Food Tour Map */}
      <div className="mt-5">
        <h2 className="fw-bold mb-3">Explore Tour Locations</h2>

        {mappedStops.length === 0 ? (
          <div className="alert alert-info">
            Map locations are not available for these tour stops yet.
          </div>
        ) : (
          <div style={{ height: '450px', width: '100%' }}>
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
                    <strong>Stop {index + 1}: {stop.name}</strong>
                    <br />
                    {stop.address}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="card shadow-sm mt-5">
        <div className="card-body p-4">

          <h3 className="fw-bold mb-4">Ratings & Reviews</h3>

          {reviews.length === 0 ? (
            <p className="text-secondary">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-bottom py-3">

                <div className="text-warning fs-5">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>

                <p className="mb-1">{review.comment}</p>

                <small className="text-secondary">
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : ''}
                </small>

              </div>
            ))
          )}

        </div>
      </div>

      {/* Submit Review Section */}
      <div className="card shadow-sm mt-4">
        <div className="card-body p-4">

          <h4 className="fw-bold mb-3">Write a Review</h4>

          <p className="text-secondary">
            Only tourists with a confirmed booking can submit a rating and review.
          </p>

          <form onSubmit={handleSubmitReview}>

            <label className="form-label fw-bold">
              Your Rating
            </label>

            <div className="mb-3">
              {[1, 2, 3, 4, 5].map((number) => (
                <button
                  key={number}
                  type="button"
                  className="btn btn-link p-1 text-decoration-none"
                  onClick={() => setRating(number)}
                  style={{
                    color: number <= rating ? '#ffc107' : '#adb5bd',
                    fontSize: '2rem',
                  }}
                  aria-label={`Rate ${number} out of 5`}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="form-label fw-bold">
              Your Review
            </label>

            <textarea
              className="form-control mb-3"
              rows="4"
              placeholder="Share your food tour experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />

            {reviewMessage && (
              <div className="alert alert-info">
                {reviewMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-warning"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}

export default FoodTourDetails;