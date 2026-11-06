
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

function AddTourStop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

const [foodTourId, setFoodTourId] = useState(
  searchParams.get('tour_id') ||
  searchParams.get('tour') ||
  ''
);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
    stop_order: 1,
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

    if (!foodTourId) {
      setError('Please enter a food tour ID.');
      return;
    }

    setLoading(true);

    const stopData = {
      food_tour: Number(foodTourId),
      ...formData,
      stop_order: Number(formData.stop_order),
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
    };

    try {
      const response = await API.post('tour-stops/create/', stopData);

      console.log('Tour stop created:', response.data);

      alert('Tour stop added successfully!');

      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        area: '',
        latitude: '',
        longitude: '',
        stop_order: Number(formData.stop_order) + 1,
      });

    } catch (error) {
      console.error('Error adding tour stop:', error);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to add tour stop. Please try again.'
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

              <h2 className="fw-bold mb-2">Add Tour Stop</h2>

              <p className="text-secondary mb-4">
                Add a food destination to your food tour itinerary.
              </p>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-4">
                  <label className="form-label">Food Tour ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={foodTourId}
                    onChange={(event) => setFoodTourId(event.target.value)}
                    min="1"
                    required
                  />
                </div>

                <hr />

                <h5 className="fw-bold mb-3">Stop Information</h5>

                <div className="mb-3">
                  <label className="form-label">Stop Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                    <label className="form-label">Latitude (Optional)</label>
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
                    <label className="form-label">Longitude (Optional)</label>
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

                <div className="mb-4">
                  <label className="form-label">Stop Order</label>
                  <input
                    type="number"
                    name="stop_order"
                    className="form-control"
                    min="1"
                    value={formData.stop_order}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-warning btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? 'Adding Stop...' : 'Add Tour Stop'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddTourStop;
