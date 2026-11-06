
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function MyItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);
  const [deletingItinerary, setDeletingItinerary] = useState(null);

  // Load the tourist's itineraries
  const fetchItineraries = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get('itineraries/');

      setItineraries(response.data.results || response.data);
    } catch (err) {
      console.error('Error loading itineraries:', err);

      if (err.response?.status === 401) {
        setError('Please log in as a tourist to view your itineraries.');
      } else if (err.response?.status === 403) {
        setError('Only registered tourists can access itineraries.');
      } else {
        setError('Unable to load your itineraries. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  // Create a new itinerary
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter an itinerary name.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      setSuccess('');

      await API.post('itineraries/', {
        title: title.trim(),
        description: description.trim()
      });

      setTitle('');
      setDescription('');
      setSuccess('Your itinerary has been created successfully.');

      await fetchItineraries();
    } catch (err) {
      console.error('Error creating itinerary:', err);

      if (err.response?.status === 401) {
        setError('Please log in before creating an itinerary.');
      } else if (err.response?.status === 403) {
        setError('Only registered tourists can create itineraries.');
      } else {
        setError('Unable to create itinerary. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  // Remove an activity from an itinerary
  const handleRemoveItem = async (itemId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this activity from your itinerary?'
    );

    if (!confirmed) return;

    try {
      setDeletingItem(itemId);
      setError('');
      setSuccess('');

      await API.delete(`itinerary-items/${itemId}/`);

      setSuccess('Activity removed from your itinerary successfully.');

      await fetchItineraries();
    } catch (err) {
      console.error('Error removing itinerary item:', err);
      setError('Unable to remove this activity. Please try again.');
    } finally {
      setDeletingItem(null);
    }
  };

  // Delete an entire itinerary
  const handleDeleteItinerary = async (itineraryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this entire itinerary and all its saved activities?'
    );

    if (!confirmed) return;

    try {
      setDeletingItinerary(itineraryId);
      setError('');
      setSuccess('');

      await API.delete(`itineraries/${itineraryId}/`);

      setSuccess('Your itinerary has been deleted successfully.');

      await fetchItineraries();
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError('Unable to delete this itinerary. Please try again.');
    } finally {
      setDeletingItinerary(null);
    }
  };

  return (
    <div className="min-vh-100 bg-light">

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            TasteLocal
          </Link>

          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">
              Home
            </Link>

            <Link className="nav-link" to="/food-experiences">
              Food Experiences
            </Link>

            <Link className="nav-link" to="/food-tours">
              Food Tours
            </Link>

            <Link className="nav-link active" to="/my-itineraries">
              My Itineraries
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-5">

        {/* Page heading */}
        <div className="mb-4">
          <h1 className="fw-bold">My Food Itineraries</h1>

          <p className="text-secondary">
            Plan your food adventures by saving food experiences
            and food tours in your personal itineraries.
          </p>
        </div>

        {/* Create itinerary form */}
        <div className="card shadow-sm mb-5">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3">
              Create a New Itinerary
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Itinerary Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Singapore Food Adventure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe your food travel plans..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Itinerary'}
              </button>
            </form>
          </div>
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="alert alert-danger">
            {error}

            {error.toLowerCase().includes('log in') && (
              <div className="mt-2">
                <Link to="/login" className="btn btn-sm btn-dark">
                  Login
                </Link>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Itinerary list */}
        <div>
          <h4 className="fw-bold mb-3">
            My Saved Itineraries
          </h4>

          {loading ? (
            <p>Loading your itineraries...</p>
          ) : itineraries.length === 0 ? (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <h5>No itineraries yet</h5>

                <p className="text-secondary">
                  Create your first itinerary to start planning
                  your food adventure.
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-4">

              {itineraries.map((itinerary) => (
                <div className="col-md-6" key={itinerary.id}>

                  <div className="card h-100 shadow-sm">

                    <div className="card-body p-4">

                      <h5 className="fw-bold">
                        {itinerary.title}
                      </h5>

                      <p className="text-secondary">
                        {itinerary.description || 'No description provided.'}
                      </p>

                      <p className="small text-secondary">
                        Activities saved: {itinerary.items?.length || 0}
                      </p>

                      <p className="small text-secondary">
                        Created: {new Date(itinerary.created_at).toLocaleDateString()}
                      </p>

                      <hr />

                      <h6 className="fw-bold mb-3">
                        Saved Activities
                      </h6>

                      {!itinerary.items || itinerary.items.length === 0 ? (
                        <p className="text-secondary">
                          No activities added yet.
                        </p>
                      ) : (
                        itinerary.items.map((item) => (
                          <div
                            key={item.id}
                            className="border rounded p-3 mb-3"
                          >

                            {item.food_experience ? (
                              <div>
                                <span className="badge bg-warning text-dark mb-2">
                                  Food Experience
                                </span>

                                <h6 className="fw-bold">
                                  {item.food_experience_title || 'Food Experience'}
                                </h6>

                                <Link
                                  to={`/food-experiences/${item.food_experience}`}
                                  className="btn btn-sm btn-outline-dark"
                                >
                                  View Experience
                                </Link>
                              </div>
                            ) : (
                              <div>
                                <span className="badge bg-info text-dark mb-2">
                                  Food Tour
                                </span>

                                <h6 className="fw-bold">
                                  {item.food_tour_title || 'Food Tour'}
                                </h6>

                                <Link
                                  to={`/food-tours/${item.food_tour}`}
                                  className="btn btn-sm btn-outline-dark"
                                >
                                  View Food Tour
                                </Link>
                              </div>
                            )}

                            {item.notes && (
                              <p className="text-secondary mt-2 mb-0">
                                {item.notes}
                              </p>
                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mt-3"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={deletingItem === item.id}
                            >
                              {deletingItem === item.id
                                ? 'Removing...'
                                : 'Remove Activity'}
                            </button>

                          </div>
                        ))
                      )}

                      <hr />

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteItinerary(itinerary.id)}
                        disabled={deletingItinerary === itinerary.id}
                      >
                        {deletingItinerary === itinerary.id
                          ? 'Deleting...'
                          : 'Delete Itinerary'}
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MyItineraries;
