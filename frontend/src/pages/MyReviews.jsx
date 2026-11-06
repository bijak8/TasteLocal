
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
    };

    const saveReview = async (reviewId) => {
        try {
            await API.patch(`my-reviews/${reviewId}/`, {
                rating,
                comment
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

    if (loading) return <p className="container mt-4">Loading your reviews...</p>;

    return (
        <div className="container mt-4">
            <h2>My Reviews</h2>

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {reviews.length === 0 ? (
                <p>You have not submitted any reviews yet.</p>
            ) : (
                <div className="row">
                    {reviews.map((review) => (
                        <div className="col-md-6 mb-3" key={review.id}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5>
                                        {review.food_experience_title ||
                                         review.food_tour_title ||
                                         'Food activity'}
                                    </h5>

                                    {editingId === review.id ? (
                                        <>
                                            <label className="form-label">
                                                Rating
                                            </label>

                                            <select
                                                className="form-select mb-3"
                                                value={rating}
                                                onChange={(e) =>
                                                    setRating(Number(e.target.value))
                                                }
                                            >
                                                {[5, 4, 3, 2, 1].map((value) => (
                                                    <option key={value} value={value}>
                                                        {value} stars
                                                    </option>
                                                ))}
                                            </select>

                                            <label className="form-label">
                                                Comment
                                            </label>

                                            <textarea
                                                className="form-control mb-3"
                                                rows="4"
                                                value={comment}
                                                onChange={(e) =>
                                                    setComment(e.target.value)
                                                }
                                            />

                                            <button
                                                className="btn btn-primary me-2"
                                                onClick={() => saveReview(review.id)}
                                            >
                                                Save Changes
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={cancelEditing}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p>
                                                Rating: {'⭐'.repeat(review.rating)}
                                            </p>

                                            <p>{review.comment}</p>

                                            <small className="text-muted d-block mb-3">
                                                {new Date(
                                                    review.created_at
                                                ).toLocaleDateString()}
                                            </small>

                                            <button
                                                className="btn btn-outline-primary btn-sm me-2"
                                                onClick={() => startEditing(review)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => deleteReview(review.id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Link
                to="/tourist/dashboard"
                className="btn btn-secondary mt-3"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}

export default MyReviews;
