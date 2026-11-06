import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

function EditFoodTour() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    area: '',
    price: '',
    date: '',
    start_time: '',
    end_time: '',
    capacity: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing food tour
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await API.get(
          `operator/food-tours/${id}/`
        );

        const tour = response.data;

        setFormData({
          title: tour.title || '',
          description: tour.description || '',
          city: tour.city || '',
          area: tour.area || '',
          price: tour.price ?? '',
          date: tour.date || '',
          start_time: tour.start_time?.slice(0, 5) || '',
          end_time: tour.end_time?.slice(0, 5) || '',
          capacity: tour.capacity ?? '',
        });
      } catch (error) {
        console.error('Error fetching food tour:', error);

        setError(
          error.response?.data?.detail ||
          'Unable to load food tour.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  // Handle form changes
  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  // Update food tour
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSaving(true);

    const tourData = {
      ...formData,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
    };

    try {
      await API.patch(
        `operator/food-tours/${id}/`,
        tourData
      );

      alert('Food tour updated successfully!');
      navigate('/operator/dashboard');
    } catch (error) {
      console.error('Error updating food tour:', error);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to update food tour. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        Loading food tour...
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">

              <h2 className="fw-bold mb-2">
                Edit Food Tour
              </h2>

              <p className="text-secondary mb-4">
                Update your food tour information.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <h5 className="fw-bold mb-3">
                  Basic Information
                </h5>

                <div className="mb-3">
                  <label className="form-label">
                    Tour Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Price (SGD)
                  </label>

                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <hr />

                <h5 className="fw-bold mb-3">
                  Schedule and Capacity
                </h5>

                <div className="mb-3">
                  <label className="form-label">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Start Time
                    </label>

                    <input
                      type="time"
                      name="start_time"
                      className="form-control"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      End Time
                    </label>

                    <input
                      type="time"
                      name="end_time"
                      className="form-control"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Maximum Participants
                  </label>

                  <input
                    type="number"
                    name="capacity"
                    className="form-control"
                    min="1"
                    step="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <hr />

                <h5 className="fw-bold mb-3">
                  Location
                </h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Area
                    </label>

                    <input
                      type="text"
                      name="area"
                      className="form-control"
                      value={formData.area}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning btn-lg w-100 mt-3"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving Changes...'
                    : 'Update Food Tour'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => navigate('/operator/dashboard')}
                >
                  Cancel
                </button>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditFoodTour;
