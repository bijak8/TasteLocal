
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function ProviderReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get('provider/reviews/');

      const data = response.data.results || response.data;
      setReviews(data);

      const responseValues = {};

      data.forEach((review) => {
        responseValues[review.id] = review.provider_response || '';
      });

      setResponses(responseValues);
    } catch (err) {
      console.error('Error fetching provider reviews:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.detail ||
        'Unable to load reviews. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }

    fetchReviews();
  }, [navigate, fetchReviews]);

  const handleResponseChange = (reviewId, value) => {
    setResponses((previous) => ({
      ...previous,
      [reviewId]: value,
    }));

    setSuccessId(null);
  };

  const handleSubmitResponse = async (reviewId) => {
    const responseText = responses[reviewId]?.trim();

    if (!responseText) {
      alert('Please enter a response before submitting.');
      return;
    }

    try {
      setSavingId(reviewId);
      setError('');
      setSuccessId(null);

      await API.patch(
        `provider/reviews/${reviewId}/respond/`,
        {
          provider_response: responseText,
        }
      );

      setReviews((previousReviews) =>
        previousReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                provider_response: responseText,
                provider_responded_at: new Date().toISOString(),
              }
            : review
        )
      );

      setSuccessId(reviewId);
    } catch (err) {
      console.error('Error submitting provider response:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      alert(
        err.response?.data?.detail ||
        'Unable to save your response. Please try again.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="provider-reviews-loading">
        <div className="provider-reviews-spinner"></div>
        <p>Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="provider-reviews-page">
      <div className="provider-reviews-container">

        {/* Page Heading */}
        <div className="provider-reviews-header">
          <div>
            <span className="provider-reviews-eyebrow">
              CUSTOMER FEEDBACK
            </span>

            <h1>Reviews</h1>

            <p>
              Read feedback from tourists and respond to their
              experiences with your business.
            </p>
          </div>

          <div className="provider-reviews-total">
            <span>{reviews.length}</span>
            <small>
              {reviews.length === 1 ? 'Review' : 'Reviews'}
            </small>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="provider-reviews-error">
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchReviews}
              className="provider-reviews-retry-btn"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && reviews.length === 0 && (
          <div className="provider-reviews-empty">
            <div className="provider-reviews-empty-icon">
              ☆
            </div>

            <h2>No reviews yet</h2>

            <p>
              When tourists review your food experiences or food
              tours, their feedback will appear here.
            </p>
          </div>
        )}

        {/* Review List */}
        <div className="provider-reviews-list">

          {reviews.map((review) => {
            const itemTitle =
              review.food_experience_title ||
              review.food_tour_title ||
              'Food Experience';

            return (
              <article
                className="provider-review-card"
                key={review.id}
              >

                {/* Review Header */}
                <div className="provider-review-top">

                  <div>
                    <span className="provider-review-item-label">
                      {review.food_experience_title
                        ? 'FOOD EXPERIENCE'
                        : 'FOOD TOUR'}
                    </span>

                    <h2>{itemTitle}</h2>
                  </div>

                  <div className="provider-review-rating">
                    <span className="provider-review-stars">
                      {'★'.repeat(review.rating)}
                      <span className="provider-review-empty-stars">
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                    </span>

                    <strong>{review.rating}/5</strong>
                  </div>

                </div>

                {/* Tourist Information */}
                <div className="provider-review-tourist">
                  <div className="provider-review-avatar">
                    {(review.tourist_username || 'T')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {review.tourist_username || 'Tourist'}
                    </strong>

                    <span>
                      Reviewed on {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>

                {/* Tourist Comment */}
                <div className="provider-review-comment">
                  <span className="provider-review-section-label">
                    TOURIST REVIEW
                  </span>

                  <p>
                    {review.comment || 'No written comment provided.'}
                  </p>
                </div>

                {/* Provider Response */}
                <div className="provider-review-response">

                  <label
                    htmlFor={`response-${review.id}`}
                    className="provider-review-section-label"
                  >
                    YOUR RESPONSE
                  </label>

                  {review.provider_response && (
                    <div className="provider-review-existing-response">
                      <p>{review.provider_response}</p>

                      {review.provider_responded_at && (
                        <small>
                          Responded on{' '}
                          {formatDate(review.provider_responded_at)}
                        </small>
                      )}
                    </div>
                  )}

                  <textarea
                    id={`response-${review.id}`}
                    value={responses[review.id] || ''}
                    onChange={(event) =>
                      handleResponseChange(
                        review.id,
                        event.target.value
                      )
                    }
                    placeholder="Write a thoughtful response to this tourist..."
                    rows={4}
                    maxLength={2000}
                  />

                  <div className="provider-review-response-footer">
                    <span>
                      {(responses[review.id] || '').length}/2000
                    </span>

                    <button
                      type="button"
                      className="provider-review-submit-btn"
                      onClick={() => handleSubmitResponse(review.id)}
                      disabled={
                        savingId === review.id ||
                        !responses[review.id]?.trim()
                      }
                    >
                      {savingId === review.id
                        ? 'Saving...'
                        : review.provider_response
                          ? 'Update Response'
                          : 'Submit Response'}
                    </button>
                  </div>

                  {successId === review.id && (
                    <div className="provider-review-success">
                      Your response has been saved successfully.
                    </div>
                  )}

                </div>

              </article>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default ProviderReviews;
