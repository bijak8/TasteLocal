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
      <div className="edit-experience-page">
        <div className="edit-experience-loading">
          <div className="edit-experience-spinner" />
          <p>Loading food experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-experience-page">
      <div className="edit-experience-container">

        <div className="edit-experience-heading">
          <span className="edit-experience-eyebrow">
            VENDOR STUDIO
          </span>

          <h1>Edit Food Experience</h1>

          <p>
            Update your experience details and keep your listing
            accurate for visitors.
          </p>
        </div>

        <div className="edit-experience-card">

          <div className="edit-experience-card-header">
            <div>
              <h2>Experience Details</h2>
              <p>Make changes to your existing food experience.</p>
            </div>

            <span className="edit-experience-icon">🍽️</span>
          </div>

          {error && (
            <div className="edit-experience-error">
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Basic Information */}
            <div className="edit-experience-section">
              <div className="edit-experience-section-heading">
                <span className="edit-experience-section-number">01</span>
                <div>
                  <h3>Basic Information</h3>
                  <p>Tell visitors about your food experience.</p>
                </div>
              </div>

              <div className="edit-experience-field">
                <label htmlFor="experience-title">
                  Experience Title
                </label>
                <input
                  id="experience-title"
                  type="text"
                  name="title"
                  placeholder="Enter experience title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-experience-field">
                <label htmlFor="experience-description">
                  Description
                </label>
                <textarea
                  id="experience-description"
                  name="description"
                  rows="5"
                  placeholder="Describe your food experience..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-experience-field-row">
                <div className="edit-experience-field">
                  <label htmlFor="experience-category">
                    Category
                  </label>
                  <input
                    id="experience-category"
                    type="text"
                    name="category"
                    placeholder="e.g. Chinese Cuisine"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="edit-experience-field">
                  <label htmlFor="experience-price">
                    Price per Participant (SGD)
                  </label>
                  <div className="edit-experience-price-input">
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

            <div className="edit-experience-divider" />

            {/* Schedule and Capacity */}
            <div className="edit-experience-section">
              <div className="edit-experience-section-heading">
                <span className="edit-experience-section-number">02</span>
                <div>
                  <h3>Schedule & Capacity</h3>
                  <p>Manage the date, timing and available spaces.</p>
                </div>
              </div>

              <div className="edit-experience-field">
                <label htmlFor="experience-date">Date</label>
                <input
                  id="experience-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-experience-field-row">
                <div className="edit-experience-field">
                  <label htmlFor="experience-start-time">
                    Start Time
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

                <div className="edit-experience-field">
                  <label htmlFor="experience-end-time">
                    End Time
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

              <div className="edit-experience-field">
                <label htmlFor="experience-capacity">
                  Maximum Participants
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
                <small>
                  Enter the maximum number of participants for this experience.
                </small>
              </div>
            </div>

            <div className="edit-experience-divider" />

            {/* Location */}
            <div className="edit-experience-section">
              <div className="edit-experience-section-heading">
                <span className="edit-experience-section-number">03</span>
                <div>
                  <h3>Location Details</h3>
                  <p>Help visitors find where your experience takes place.</p>
                </div>
              </div>

              <div className="edit-experience-field">
                <label htmlFor="experience-address">Address</label>
                <input
                  id="experience-address"
                  type="text"
                  name="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-experience-field-row">
                <div className="edit-experience-field">
                  <label htmlFor="experience-city">City</label>
                  <input
                    id="experience-city"
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="edit-experience-field">
                  <label htmlFor="experience-area">Area</label>
                  <input
                    id="experience-area"
                    type="text"
                    name="area"
                    placeholder="Enter area"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="edit-experience-coordinate-note">
                <strong>Map Coordinates</strong>
                <span>Optional. Keep these values if your location is already mapped.</span>
              </div>

              <div className="edit-experience-field-row">
                <div className="edit-experience-field">
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

                <div className="edit-experience-field">
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

            {/* Form Actions */}
            <div className="edit-experience-actions">
              <button
                type="submit"
                className="edit-experience-save-btn"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>

              <button
                type="button"
                className="edit-experience-cancel-btn"
                onClick={() => navigate('/vendor/dashboard')}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EditFoodExperience;