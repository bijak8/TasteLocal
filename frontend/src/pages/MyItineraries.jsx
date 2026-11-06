
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
        description: description.trim(),
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
    <section className="my-itineraries-page">
      <div className="my-itineraries-container">

        <div className="my-itineraries-heading">
          <span className="my-itineraries-eyebrow">
            YOUR PERSONAL FOOD JOURNEY
          </span>
          <h1>My Food Itineraries</h1>
          <p>
            Plan your food adventures by saving food experiences
            and food tours in your personal itineraries.
          </p>
        </div>

        <div className="create-itinerary-card">
          <div className="create-itinerary-heading">
            <div className="create-itinerary-icon">✦</div>
            <div>
              <h2>Create a New Itinerary</h2>
              <p>Give your next food adventure a name.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="itinerary-form">
            <div className="itinerary-form-field">
              <label htmlFor="itinerary-title">Itinerary Name</label>
              <input
                id="itinerary-title"
                type="text"
                placeholder="e.g. Singapore Food Adventure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className="itinerary-form-field">
              <label htmlFor="itinerary-description">Description</label>
              <textarea
                id="itinerary-description"
                rows="3"
                placeholder="Describe your food travel plans..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="itinerary-create-btn"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Itinerary'}
            </button>
          </form>
        </div>

        {error && (
          <div className="itineraries-alert itineraries-alert-error" role="alert">
            <span>{error}</span>

            {error.toLowerCase().includes('log in') && (
              <Link to="/login" className="itineraries-login-link">
                Log In
              </Link>
            )}
          </div>
        )}

        {success && (
          <div className="itineraries-alert itineraries-alert-success" role="status">
            {success}
          </div>
        )}

        <div className="saved-itineraries-section">
          <div className="saved-itineraries-heading">
            <div>
              <span className="my-itineraries-eyebrow">YOUR COLLECTION</span>
              <h2>My Saved Itineraries</h2>
            </div>

            {!loading && !error && (
              <span className="itinerary-count">
                {itineraries.length} {itineraries.length === 1 ? 'Itinerary' : 'Itineraries'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="itineraries-loading">
              <div className="itineraries-loader"></div>
              <p>Loading your itineraries...</p>
            </div>
          ) : !error && itineraries.length === 0 ? (
            <div className="itineraries-empty">
              <div className="itineraries-empty-icon">✦</div>
              <h3>No Itineraries Yet</h3>
              <p>
                Create your first itinerary to start planning
                your food adventure.
              </p>
            </div>
          ) : (
            <div className="itineraries-grid">
              {itineraries.map((itinerary) => (
                <article className="itinerary-card" key={itinerary.id}>
                  <div className="itinerary-card-header">
                    <div>
                      <span className="itinerary-card-label">
                        FOOD ADVENTURE
                      </span>
                      <h3>{itinerary.title}</h3>
                    </div>

                    <span className="itinerary-activity-count">
                      {itinerary.items?.length || 0} saved
                    </span>
                  </div>

                  <div className="itinerary-card-body">
                    <p className="itinerary-description">
                      {itinerary.description || 'No description provided.'}
                    </p>

                    <p className="itinerary-created">
                      Created: {new Date(itinerary.created_at).toLocaleDateString()}
                    </p>

                    <div className="itinerary-activities-heading">
                      <h4>Saved Activities</h4>
                    </div>

                    {!itinerary.items || itinerary.items.length === 0 ? (
                      <div className="itinerary-no-activities">
                        <p>No activities added yet.</p>
                        <Link to="/food-experiences">
                          Explore Food Experiences
                        </Link>
                      </div>
                    ) : (
                      <div className="itinerary-activities-list">
                        {itinerary.items.map((item) => (
                          <div className="itinerary-activity" key={item.id}>
                            {item.food_experience ? (
                              <>
                                <span className="itinerary-activity-type experience-type">
                                  Food Experience
                                </span>

                                <h5>
                                  {item.food_experience_title || 'Food Experience'}
                                </h5>

                                <Link
                                  to={`/food-experiences/${item.food_experience}`}
                                  className="itinerary-view-link"
                                >
                                  View Experience
                                </Link>
                              </>
                            ) : (
                              <>
                                <span className="itinerary-activity-type tour-type">
                                  Food Tour
                                </span>

                                <h5>
                                  {item.food_tour_title || 'Food Tour'}
                                </h5>

                                <Link
                                  to={`/food-tours/${item.food_tour}`}
                                  className="itinerary-view-link"
                                >
                                  View Food Tour
                                </Link>
                              </>
                            )}

                            {item.notes && (
                              <p className="itinerary-activity-notes">
                                {item.notes}
                              </p>
                            )}

                            <button
                              type="button"
                              className="itinerary-remove-btn"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={deletingItem === item.id}
                            >
                              {deletingItem === item.id
                                ? 'Removing...'
                                : 'Remove Activity'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="itinerary-card-footer">
                    <button
                      type="button"
                      className="itinerary-delete-btn"
                      onClick={() => handleDeleteItinerary(itinerary.id)}
                      disabled={deletingItinerary === itinerary.id}
                    >
                      {deletingItinerary === itinerary.id
                        ? 'Deleting...'
                        : 'Delete Itinerary'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default MyItineraries;
