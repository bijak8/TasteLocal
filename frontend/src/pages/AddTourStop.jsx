
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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

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

      setSuccess('Tour stop added successfully!');

      setFormData((previous) => ({
        name: '',
        description: '',
        address: '',
        city: '',
        area: '',
        latitude: '',
        longitude: '',
        stop_order: Number(previous.stop_order) + 1,
      }));

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
    <div className="add-stop-page">
      <div className="add-stop-container">

        <div className="add-stop-heading">
          <span className="add-stop-eyebrow">TOUR MANAGEMENT</span>
          <h1>Add a Tour Stop</h1>
          <p>
            Build your food tour itinerary by adding restaurants,
            food destinations and local culinary experiences.
          </p>
        </div>

        <div className="add-stop-card">

          <div className="add-stop-card-header">
            <div>
              <h2>Stop Details</h2>
              <p>Complete the information below to add a destination.</p>
            </div>
            <div className="add-stop-icon">✦</div>
          </div>

          {error && (
            <div className="add-stop-error">
              {error}
            </div>
          )}

          {success && (
  <div className="add-stop-success" role="status">
    <strong>Success!</strong> {success}
  </div>
)}

          <form onSubmit={handleSubmit}>

            <section className="add-stop-section">
              <div className="add-stop-section-heading">
                <span className="add-stop-section-number">01</span>
                <div>
                  <h3>Food Tour</h3>
                  <p>Choose the tour this stop belongs to.</p>
                </div>
              </div>

              <div className="add-stop-field">
                <label htmlFor="foodTourId">Food Tour ID</label>
                <input
                  id="foodTourId"
                  type="number"
                  value={foodTourId}
                  onChange={(event) => setFoodTourId(event.target.value)}
                  min="1"
                  required
                  placeholder="Enter food tour ID"
                />
              </div>
            </section>

            <div className="add-stop-divider" />

            <section className="add-stop-section">
              <div className="add-stop-section-heading">
                <span className="add-stop-section-number">02</span>
                <div>
                  <h3>Destination Information</h3>
                  <p>Tell visitors about this food destination.</p>
                </div>
              </div>

              <div className="add-stop-field">
                <label htmlFor="name">Stop Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Traditional Dim Sum Restaurant"
                />
              </div>

              <div className="add-stop-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe the food, atmosphere and experience..."
                />
              </div>

              <div className="add-stop-field">
                <label htmlFor="address">Full Address</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter the complete street address"
                />
              </div>

              <div className="add-stop-field-row">
                <div className="add-stop-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Singapore"
                  />
                </div>

                <div className="add-stop-field">
                  <label htmlFor="area">Area / Neighbourhood</label>
                  <input
                    id="area"
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Chinatown"
                  />
                </div>
              </div>
            </section>

            <div className="add-stop-divider" />

            <section className="add-stop-section">
              <div className="add-stop-section-heading">
                <span className="add-stop-section-number">03</span>
                <div>
                  <h3>Location & Sequence</h3>
                  <p>Set the map coordinates and itinerary order.</p>
                </div>
              </div>

              <div className="add-stop-field-row">
                <div className="add-stop-field">
                  <label htmlFor="latitude">Latitude <span>(Optional)</span></label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 1.3521"
                  />
                </div>

                <div className="add-stop-field">
                  <label htmlFor="longitude">Longitude <span>(Optional)</span></label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 103.8198"
                  />
                </div>
              </div>

              <div className="add-stop-field add-stop-order-field">
                <label htmlFor="stop_order">Stop Order</label>
                <input
                  id="stop_order"
                  type="number"
                  name="stop_order"
                  min="1"
                  value={formData.stop_order}
                  onChange={handleChange}
                  required
                />
                <small>
                  Determines where this destination appears in the tour itinerary.
                </small>
              </div>
            </section>

            <div className="add-stop-submit-area">
              <button
                type="submit"
                className="add-stop-submit-btn"
                disabled={loading}
              >
                {loading ? 'Adding Stop...' : 'Add Tour Stop'}
              </button>
              <p>Your destination will be added to the selected food tour.</p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTourStop;
