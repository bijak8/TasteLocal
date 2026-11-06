
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const fetchReviews = async () => {
    try {
      setError('');
      const response = await API.get('my-reviews/');
      setReviews(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load your reviews.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const startEditing = (review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    setMessage('');
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setRating(5);
    setComment('');
    setError('');
  };

  const saveReview = async (reviewId) => {
    try {
      setError('');

      await API.patch(`my-reviews/${reviewId}/`, {
        rating,
        comment,
      });

      setMessage('Review updated successfully.');
      setEditingId(null);
      await fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to update your review.'
      );
    }
  };

  const deleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this review?'
    );

    if (!confirmed) return;

    try {
      await API.delete(`my-reviews/${reviewId}/`);

      setReviews((previous) =>
        previous.filter((review) => review.id !== reviewId)
      );

      setMessage('Review deleted successfully.');
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete your review.'
      );
    }
  };

  if (loading) {
    return (
      <section className="my-reviews-page">
        <div className="reviews-loading">
          <div className="reviews-loader"></div>
          <p>Loading your reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-reviews-page">
      <div className="my-reviews-container">

        {/* Page heading */}
        <div className="reviews-page-heading">
          <div>
            <span className="reviews-eyebrow">
              YOUR TASTELOCAL CONTRIBUTIONS
            </span>
            <h1>My Reviews</h1>
            <p>
              Revisit your food adventures and manage the
              reviews you've shared with the community.
            </p>
          </div>

          <Link
            to="/tourist/dashboard"
            className="reviews-back-btn"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className="reviews-alert reviews-alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="reviews-alert reviews-alert-error" role="alert">
            {error}
          </div>
        )}

        {/* Review summary */}
        <div className="reviews-summary">
          <div>
            <span className="reviews-summary-label">
              TOTAL REVIEWS
            </span>
            <strong>{reviews.length}</strong>
          </div>
          <span className="reviews-summary-icon">★</span>
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="reviews-empty-state">
            <div className="reviews-empty-icon">★</div>
            <h2>No Reviews Yet</h2>
            <p>
              Once you share feedback about a food experience
              or food tour, your reviews will appear here.
            </p>
            <Link
              to="/food-experiences"
              className="reviews-explore-btn"
            >
              Explore Food Experiences
            </Link>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-top">
                  <span className="review-card-label">
                    YOUR REVIEW
                  </span>
                  <span className="review-card-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h2>
                  {review.food_experience_title ||
                    review.food_tour_title ||
                    'Food activity'}
                </h2>

                {editingId === review.id ? (
                  <div className="review-edit-form">

                    <div className="review-form-group">
                      <label htmlFor={`rating-${review.id}`}>
                        Your Rating
                      </label>
                      <select
                        id={`rating-${review.id}`}
                        value={rating}
                        onChange={(event) =>
                          setRating(Number(event.target.value))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} {value === 1 ? 'Star' : 'Stars'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="review-form-group">
                      <label htmlFor={`comment-${review.id}`}>
                        Your Comment
                      </label>
                      <textarea
                        id={`comment-${review.id}`}
                        rows="5"
                        value={comment}
                        onChange={(event) =>
                          setComment(event.target.value)
                        }
                      />
                    </div>

                    <div className="review-actions">
                      <button
                        type="button"
                        className="review-save-btn"
                        onClick={() => saveReview(review.id)}
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        className="review-cancel-btn"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="review-rating"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {'★'.repeat(review.rating)}
                      <span>
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                      <small>{review.rating}/5</small>
                    </div>

                    <p className="review-comment">
                      {review.comment}
                    </p>

                    <div className="review-actions">
                      <button
                        type="button"
                        className="review-edit-btn"
                        onClick={() => startEditing(review)}
                      >
                        Edit Review
                      </button>

                      <button
                        type="button"
                        className="review-delete-btn"
                        onClick={() => deleteReview(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default MyReviews;
