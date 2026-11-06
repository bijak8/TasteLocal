
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function CreateFoodExperience() {
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const experienceData = {
      ...formData,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
    };

    try {
      const response = await API.post(
        'food-experiences/create/',
        experienceData
      );

      console.log('Food experience created:', response.data);

      alert('Food experience created successfully!');
      navigate('/food-experiences');

    } catch (error) {
      console.error('Error creating food experience:', error);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to create food experience. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">

              <h2 className="fw-bold mb-2">
                Create Food Experience
              </h2>

              <p className="text-secondary mb-4">
                Share your local food activities with tourists.
              </p>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>

                <h5 className="fw-bold mb-3">Basic Information</h5>

                <div className="mb-3">
                  <label className="form-label">Experience Title</label>
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
                  <label className="form-label">Description</label>
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
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    name="category"
                    className="form-control"
                    placeholder="e.g. Cooking Class, Food Tasting"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Price (SGD)</label>
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

                <h5 className="fw-bold mb-3">Schedule and Capacity</h5>

                <div className="mb-3">
                  <label className="form-label">Date</label>
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
                    <label className="form-label">Start Time</label>
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
                    <label className="form-label">End Time</label>
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

                <h5 className="fw-bold mb-3">Location</h5>

                <div className="mb-3">
                  <label className="form-label">Address</label>
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
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Area</label>
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
                  disabled={loading}
                >
                  {loading
                    ? 'Creating...'
                    : 'Publish Food Experience'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateFoodExperience;
