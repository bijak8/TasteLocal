
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
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
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
    <section className="create-experience-page">
      <div className="create-experience-container">

        <div className="create-experience-heading">
          <span className="create-experience-eyebrow">
            SHARE YOUR LOCAL FLAVOURS
          </span>
          <h1>Create Food Experience</h1>
          <p>
            Bring your culinary activities to life and invite
            travellers to discover something memorable.
          </p>
        </div>

        <div className="create-experience-card">

          <div className="create-experience-card-heading">
            <div className="create-experience-icon">✦</div>
            <div>
              <h2>Experience Details</h2>
              <p>Complete the information below to publish your experience.</p>
            </div>
          </div>

          {error && (
            <div className="create-experience-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Basic Information */}
            <div className="create-experience-section">
              <div className="create-experience-section-heading">
                <span>01</span>
                <div>
                  <h3>Basic Information</h3>
                  <p>Tell travellers what makes your experience special.</p>
                </div>
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-title">
                  Experience Title *
                </label>
                <input
                  id="experience-title"
                  type="text"
                  name="title"
                  placeholder="e.g. Traditional Malaysian Cooking Class"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-description">
                  Description *
                </label>
                <textarea
                  id="experience-description"
                  name="description"
                  rows="5"
                  placeholder="Describe the activities, food and highlights..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-experience-form-grid">
                <div className="create-experience-field">
                  <label htmlFor="experience-category">
                    Category *
                  </label>
                  <input
                    id="experience-category"
                    type="text"
                    name="category"
                    placeholder="e.g. Cooking Class, Food Tasting"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="create-experience-field">
                  <label htmlFor="experience-price">
                    Price (SGD) *
                  </label>
                  <div className="create-experience-price-input">
                    <span>SGD</span>
                    <input
                      id="experience-price"
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
            </div>

            {/* Schedule and Capacity */}
            <div className="create-experience-section">
              <div className="create-experience-section-heading">
                <span>02</span>
                <div>
                  <h3>Schedule and Capacity</h3>
                  <p>Set the date, duration and number of participants.</p>
                </div>
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-date">Date *</label>
                <input
                  id="experience-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-experience-form-grid">
                <div className="create-experience-field">
                  <label htmlFor="experience-start-time">
                    Start Time *
                  </label>
                  <input
                    id="experience-start-time"
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="create-experience-field">
                  <label htmlFor="experience-end-time">
                    End Time *
                  </label>
                  <input
                    id="experience-end-time"
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-capacity">
                  Maximum Participants *
                </label>
                <input
                  id="experience-capacity"
                  type="number"
                  name="capacity"
                  min="1"
                  placeholder="e.g. 10"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="create-experience-section">
              <div className="create-experience-section-heading">
                <span>03</span>
                <div>
                  <h3>Location</h3>
                  <p>Help travellers find where your experience takes place.</p>
                </div>
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-address">Address *</label>
                <input
                  id="experience-address"
                  type="text"
                  name="address"
                  placeholder="Enter the full street address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-experience-form-grid">
                <div className="create-experience-field">
                  <label htmlFor="experience-city">City</label>
                  <input
                    id="experience-city"
                    type="text"
                    name="city"
                    placeholder="e.g. Singapore"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="create-experience-field">
                  <label htmlFor="experience-area">Area</label>
                  <input
                    id="experience-area"
                    type="text"
                    name="area"
                    placeholder="e.g. Chinatown"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="create-experience-location-note">
                <strong>Optional GPS coordinates</strong>
                <p>
                  Add latitude and longitude if you want to provide
                  more precise map positioning.
                </p>
              </div>

              <div className="create-experience-form-grid">
                <div className="create-experience-field">
                  <label htmlFor="experience-latitude">
                    Latitude
                  </label>
                  <input
                    id="experience-latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    placeholder="e.g. 1.3521"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>

                <div className="create-experience-field">
                  <label htmlFor="experience-longitude">
                    Longitude
                  </label>
                  <input
                    id="experience-longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    placeholder="e.g. 103.8198"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="create-experience-actions">
              <button
                type="button"
                className="create-experience-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-experience-submit-btn"
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Food Experience'}
              </button>
            </div>

            <p className="create-experience-required-note">
              * Required fields
            </p>

          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateFoodExperience;
