
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

  if (loading) {
    return <div className="container py-5">Loading favourites...</div>;
  }

  return (
    <div className="container py-5">

      <h1 className="fw-bold mb-2">My Favourites</h1>

      <p className="text-secondary mb-4">
        Your saved food experiences and food tours.
      </p>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {favourites.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body p-5 text-center">
            <h4>No favourites yet</h4>

            <p className="text-secondary">
              Explore food experiences and food tours and save the ones you like.
            </p>

            <Link
              to="/food-experiences"
              className="btn btn-warning me-2"
            >
              Explore Food Experiences
            </Link>

            <Link
              to="/food-tours"
              className="btn btn-outline-dark"
            >
              Explore Food Tours
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">

          {favourites.map((item) => {
            const isExperience = Boolean(item.food_experience);
            const title = isExperience
              ? item.food_experience_title
              : item.food_tour_title;

            const detailsLink = isExperience
              ? `/food-experiences/${item.food_experience}`
              : `/food-tours/${item.food_tour}`;

            return (
              <div className="col-md-6 col-lg-4" key={item.id}>
                <div className="card shadow-sm h-100">

                  <div className="card-body d-flex flex-column">

                    <span className="badge bg-warning text-dark align-self-start mb-3">
                      {isExperience ? 'Food Experience' : 'Food Tour'}
                    </span>

                    <h5 className="fw-bold">
                      {title || 'Untitled'}
                    </h5>

                    <p className="text-secondary">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </p>

                    <div className="mt-auto d-flex gap-2">

                      <Link
                        to={detailsLink}
                        className="btn btn-dark flex-grow-1"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveFavourite(item.id)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? '...' : '♥'}
                      </button>

                    </div>

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default MyFavourites;
