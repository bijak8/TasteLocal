
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function MyFavourites() {
  const navigate = useNavigate();

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  // Fetch favourites
  const fetchFavourites = async () => {
    try {
      const response = await API.get('favourites/');
      setFavourites(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching favourites:', error);
      setError('Unable to load your favourites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    fetchFavourites();
  }, [navigate]);

  // Remove favourite
  const handleRemoveFavourite = async (favouriteId) => {
    try {
      setRemovingId(favouriteId);
      setError('');

      await API.delete(`favourites/${favouriteId}/`);

      setFavourites((previousFavourites) =>
        previousFavourites.filter(
          (item) => item.id !== favouriteId
        )
      );
    } catch (error) {
      console.error('Error removing favourite:', error);
      setError('Unable to remove this favourite. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="my-favourites-page">
      <div className="my-favourites-container">

        <div className="my-favourites-heading">
          <span className="my-favourites-eyebrow">
            YOUR PERSONAL COLLECTION
          </span>

          <h1>My Favourites</h1>

          <p>
            Keep all your favourite food experiences and food tours
            together in one place.
          </p>
        </div>

        {!loading && !error && favourites.length > 0 && (
          <div className="favourites-summary">
            <span className="favourites-summary-number">
              {favourites.length}
            </span>
            <span className="favourites-summary-label">
              {favourites.length === 1 ? 'Saved Favourite' : 'Saved Favourites'}
            </span>
          </div>
        )}

        {loading && (
          <div className="favourites-loading">
            <div className="favourites-loader"></div>
            <p>Loading your favourites...</p>
          </div>
        )}

        {error && (
          <div className="favourites-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && favourites.length === 0 && (
          <div className="favourites-empty">
            <div className="favourites-empty-icon">♥</div>

            <h2>No Favourites Yet</h2>

            <p>
              You haven't saved any favourites yet. Explore our food
              experiences and food tours and save the ones you love.
            </p>

            <div className="favourites-empty-actions">
              <Link
                to="/food-experiences"
                className="favourites-explore-btn"
              >
                Explore Food Experiences
              </Link>

              <Link
                to="/food-tours"
                className="favourites-secondary-btn"
              >
                Explore Food Tours
              </Link>
            </div>
          </div>
        )}

        {!loading && favourites.length > 0 && (
          <div className="favourites-grid">
            {favourites.map((item) => {
              const isExperience = Boolean(item.food_experience);

              const title = isExperience
                ? item.food_experience_title
                : item.food_tour_title;

              const detailsLink = isExperience
                ? `/food-experiences/${item.food_experience}`
                : `/food-tours/${item.food_tour}`;

              return (
                <article className="favourite-card" key={item.id}>
                  <div className="favourite-card-top">
                    <span
                      className={`favourite-type ${
                        isExperience
                          ? 'favourite-type-experience'
                          : 'favourite-type-tour'
                      }`}
                    >
                      {isExperience ? 'Food Experience' : 'Food Tour'}
                    </span>

                    <span className="favourite-heart" aria-label="Favourite">
                      ♥
                    </span>
                  </div>

                  <div className="favourite-card-body">
                    <h2>{title || 'Untitled'}</h2>

                    <p className="favourite-date">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </p>

                    <div className="favourite-card-actions">
                      <Link
                        to={detailsLink}
                        className="favourite-view-btn"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="favourite-remove-btn"
                        onClick={() => handleRemoveFavourite(item.id)}
                        disabled={removingId === item.id}
                        aria-label={`Remove ${title || 'favourite'}`}
                      >
                        {removingId === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
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

export default MyFavourites;
