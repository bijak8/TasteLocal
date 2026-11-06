
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function CreateFoodTour() {
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

    const tourData = {
      ...formData,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
    };

    try {
      const response = await API.post('food-tours/create/', tourData);

      console.log('Food tour created:', response.data);

      alert('Food tour created successfully!');
      navigate('/food-tours');

    } catch (error) {
      console.error('Error creating food tour:', error);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to create food tour. Please try again.'
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
                Create Food Tour
              </h2>

              <p className="text-secondary mb-4">
                Create a guided food tour and introduce tourists
                to local culinary destinations.
              </p>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>

                <h5 className="fw-bold mb-3">Tour Information</h5>

                <div className="mb-3">
                  <label className="form-label">Tour Title</label>
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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      required
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
                  <label className="form-label">Tour Date</label>
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

                <div className="mb-4">
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

                <button
                  type="submit"
                  className="btn btn-warning btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Publish Food Tour'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateFoodTour;
