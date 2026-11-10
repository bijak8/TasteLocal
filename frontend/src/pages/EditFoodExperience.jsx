import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

function EditFoodExperience() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    date: '',
    start_time: '',
    end_time: '',
    capacity: '',
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing food experience
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await API.get(
          `vendor/food-experiences/${id}/`
        );

        const experience = response.data;

        setFormData({
          title: experience.title || '',
          description: experience.description || '',
          category: experience.category || '',
          price: experience.price || '',
          date: experience.date || '',
          start_time: experience.start_time || '',
          end_time: experience.end_time || '',
          capacity: experience.capacity || '',
          address: experience.address || '',
          city: experience.city || '',
          area: experience.area || '',
          latitude: experience.latitude ?? '',
          longitude: experience.longitude ?? '',
        });

      } catch (error) {
        console.error('Error fetching food experience:', error);

        setError(
          error.response?.data?.detail ||
          'Unable to load food experience.'
        );

      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  // Handle form changes
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Update food experience
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSaving(true);

    const experienceData = {
      ...formData,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      latitude: formData.latitude === ''
        ? null
        : Number(formData.latitude),
      longitude: formData.longitude === ''
        ? null
        : Number(formData.longitude),
    };

    try {
      await API.patch(
        `vendor/food-experiences/${id}/`,
        experienceData
      );

      alert('Food experience updated successfully!');

      navigate('/vendor/dashboard');

    } catch (error) {
      console.error('Error updating food experience:', error);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to update food experience. Please try again.'
      );

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        Loading food experience...
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
                Edit Food Experience
              </h2>

              <p className="text-secondary mb-4">
                Update your food experience information.
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
                    Experience Title
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
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    className="form-control"
                    value={formData.category}
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
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <hr />

                <h5 className="fw-bold mb-3">
                  Location
                </h5>

                <div className="mb-3">
                  <label className="form-label">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Latitude (Optional)
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      className="form-control"
                      value={formData.latitude}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Longitude (Optional)
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      className="form-control"
                      value={formData.longitude}
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
                    : 'Update Food Experience'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => navigate('/vendor/dashboard')}
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

export default EditFoodExperience;
