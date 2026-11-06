
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
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
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
    <div className="create-tour-page">
      <div className="create-tour-container">

        {/* Page Heading */}
        <div className="create-tour-heading">
          <span className="create-tour-eyebrow">
            TOUR OPERATOR STUDIO
          </span>

          <h1>Create a Food Tour</h1>

          <p>
            Bring local flavours and memorable culinary destinations
            together in a guided food tour.
          </p>
        </div>

        <div className="create-tour-card">

          {/* Form Header */}
          <div className="create-tour-card-header">
            <div>
              <h2>Tour Details</h2>
              <p>Complete the information below to create your tour.</p>
            </div>

            <span className="create-tour-icon">🍜</span>
          </div>

          {error && (
            <div className="create-tour-error">
              <strong>Unable to create tour</strong>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Section 1: Tour Information */}
            <div className="create-tour-section">

              <div className="create-tour-section-heading">
                <span className="create-tour-section-number">01</span>

                <div>
                  <h3>Tour Information</h3>
                  <p>Tell visitors what makes your food tour special.</p>
                </div>
              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-title">Tour Title</label>

                <input
                  id="tour-title"
                  type="text"
                  name="title"
                  placeholder="e.g. Traditional Chinese Food Adventure"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-description">Description</label>

                <textarea
                  id="tour-description"
                  name="description"
                  rows="5"
                  placeholder="Describe the food, culture and experiences visitors can expect..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-tour-field-row">

                <div className="create-tour-field">
                  <label htmlFor="tour-city">City</label>

                  <input
                    id="tour-city"
                    type="text"
                    name="city"
                    placeholder="e.g. Singapore"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="create-tour-field">
                  <label htmlFor="tour-area">Area</label>

                  <input
                    id="tour-area"
                    type="text"
                    name="area"
                    placeholder="e.g. Chinatown"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-price">
                  Price per Participant (SGD)
                </label>

                <div className="create-tour-price-input">
                  <span>SGD</span>

                  <input
                    id="tour-price"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

            </div>

            <div className="create-tour-divider" />

            {/* Section 2: Schedule and Capacity */}
            <div className="create-tour-section">

              <div className="create-tour-section-heading">
                <span className="create-tour-section-number">02</span>

                <div>
                  <h3>Schedule & Capacity</h3>
                  <p>Set the date, duration and number of participants.</p>
                </div>
              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-date">Tour Date</label>

                <input
                  id="tour-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-tour-field-row">

                <div className="create-tour-field">
                  <label htmlFor="tour-start-time">Start Time</label>

                  <input
                    id="tour-start-time"
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="create-tour-field">
                  <label htmlFor="tour-end-time">End Time</label>

                  <input
                    id="tour-end-time"
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-capacity">
                  Maximum Participants
                </label>

                <input
                  id="tour-capacity"
                  type="number"
                  name="capacity"
                  min="1"
                  step="1"
                  placeholder="e.g. 12"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />

                <small>
                  Enter the maximum number of guests for this tour.
                </small>
              </div>

            </div>

            {/* Submit */}
            <div className="create-tour-submit-area">

              <button
                type="submit"
                className="create-tour-submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating Tour...' : 'Publish Food Tour'}
              </button>

              <p>
                Please review your tour details before publishing.
              </p>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default CreateFoodTour;
