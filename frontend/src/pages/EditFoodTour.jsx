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

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

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
      <div className="edit-tour-loading">
        <div className="edit-tour-spinner"></div>
        <p>Loading food tour...</p>
      </div>
    );
  }

  return (
    <div className="edit-tour-page">
      <div className="edit-tour-container">

        <div className="edit-tour-heading">
          <span className="edit-tour-eyebrow">
            TOUR OPERATOR
          </span>

          <h1>Edit Food Tour</h1>

          <p>
            Update your tour details, schedule and location.
          </p>
        </div>

        <div className="edit-tour-card">

          <form onSubmit={handleSubmit}>

            {error && (
              <div className="edit-tour-error">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <section className="edit-tour-section">

              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">01</span>
                <div>
                  <h2>Basic Information</h2>
                  <p>Tell travellers about your food tour.</p>
                </div>
              </div>

              <div className="edit-tour-field">
                <label htmlFor="title">Tour Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your tour title"
                  required
                />
              </div>

              <div className="edit-tour-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the food tour experience..."
                  required
                />
              </div>

              <div className="edit-tour-field">
                <label htmlFor="price">Price per Person (SGD)</label>
                <div className="edit-tour-price-input">
                  <span>SGD</span>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

            </section>

            <div className="edit-tour-divider"></div>

            {/* Schedule and Capacity */}
            <section className="edit-tour-section">

              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">02</span>
                <div>
                  <h2>Schedule and Capacity</h2>
                  <p>Set the date, duration and group size.</p>
                </div>
              </div>

              <div className="edit-tour-field">
                <label htmlFor="date">Tour Date</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-tour-field-row">

                <div className="edit-tour-field">
                  <label htmlFor="start_time">Start Time</label>
                  <input
                    id="start_time"
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="edit-tour-field">
                  <label htmlFor="end_time">End Time</label>
                  <input
                    id="end_time"
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="edit-tour-field">
                <label htmlFor="capacity">Maximum Participants</label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  min="1"
                  step="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Enter maximum participants"
                  required
                />
              </div>

            </section>

            <div className="edit-tour-divider"></div>

            {/* Location */}
            <section className="edit-tour-section">

              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">03</span>
                <div>
                  <h2>Location</h2>
                  <p>Where will your food tour take place?</p>
                </div>
              </div>

              <div className="edit-tour-field-row">

                <div className="edit-tour-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="edit-tour-field">
                  <label htmlFor="area">Area</label>
                  <input
                    id="area"
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Enter area"
                  />
                </div>

              </div>

            </section>

            {/* Form Actions */}
            <div className="edit-tour-actions">

              <button
                type="button"
                className="edit-tour-cancel-btn"
                onClick={() => navigate('/operator/dashboard')}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="edit-tour-save-btn"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Update Food Tour'}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default EditFoodTour;