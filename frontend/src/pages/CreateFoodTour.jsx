import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function CreateFoodTour() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tour_category: '',
    city: '',
    area: '',
    price: '',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  const [sessions, setSessions] = useState([
    { date: '', start_time: '', end_time: '', capacity: '' },
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('categories/food-tour/');
        const categoryData = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setCategories(categoryData.filter((category) => category.is_active));
      } catch (fetchError) {
        console.error('Error fetching food tour categories:', fetchError);
        setCategoryError('Unable to load food tour categories.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must not exceed 5MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setImage(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    const fileInput = document.getElementById('tour-image');
    if (fileInput) fileInput.value = '';
  };

  const handleSessionChange = (index, event) => {
    const { name, value } = event.target;
    setSessions((previousSessions) =>
      previousSessions.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, [name]: value } : session
      )
    );
  };

  const addSession = () => {
    setSessions((previousSessions) => [
      ...previousSessions,
      { date: '', start_time: '', end_time: '', capacity: '' },
    ]);
  };

  const removeSession = (index) => {
    if (sessions.length === 1) return;
    setSessions((previousSessions) =>
      previousSessions.filter((_, sessionIndex) => sessionIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.tour_category) {
      setError('Please select a food tour category.');
      return;
    }

    if (formData.price === '' || Number(formData.price) < 0) {
      setError('Please enter a valid food tour price.');
      return;
    }

    for (let index = 0; index < sessions.length; index += 1) {
      const session = sessions[index];

      if (!session.date || !session.start_time || !session.end_time || !session.capacity) {
        setError(`Please complete all fields in Session ${index + 1}.`);
        return;
      }

      if (session.end_time <= session.start_time) {
        setError(`Session ${index + 1}: End time must be later than start time.`);
        return;
      }

      if (Number(session.capacity) < 1) {
        setError(`Session ${index + 1}: Capacity must be at least 1.`);
        return;
      }
    }

    setLoading(true);

    try {
      const firstSession = sessions[0];
      const tourData = {
        ...formData,
        tour_category: Number(formData.tour_category),
        price: Number(formData.price),
        date: firstSession.date,
        start_time: firstSession.start_time,
        end_time: firstSession.end_time,
        capacity: Number(firstSession.capacity),
      };

      const data = new FormData();
      Object.entries(tourData).forEach(([key, value]) => data.append(key, value));

      if (image) data.append('image', image);

      const response = await API.post('food-tours/create/', data);
      const foodTourId = response.data.id;

      for (const session of sessions) {
        await API.post('operator/availability-sessions/', {
          food_tour: foodTourId,
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          capacity: Number(session.capacity),
        });
      }

      alert('Food tour and availability sessions created successfully!');
      navigate('/food-tours');
    } catch (submitError) {
      console.error('Error creating food tour or sessions:', submitError);
      setError(
        submitError.response?.data
          ? JSON.stringify(submitError.response.data)
          : 'Unable to complete the food tour creation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tour-page">
      <div className="create-tour-container">
        <div className="create-tour-heading">
          <span className="create-tour-eyebrow">TOUR OPERATOR STUDIO</span>
          <h1>Create a Food Tour</h1>
          <p>
            Bring local flavours and memorable culinary destinations together
            in a guided food tour.
          </p>
        </div>

        <div className="create-tour-card">
          <div className="create-tour-card-header">
            <div>
              <h2>Tour Details</h2>
              <p>Complete the information below to create your tour.</p>
            </div>
            <span className="create-tour-icon">🍜</span>
          </div>

          {error && (
            <div className="create-tour-error" role="alert">
              <strong>Unable to create tour</strong>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="create-tour-section">
              <div className="create-tour-section-heading">
                <span className="create-tour-section-number">01</span>
                <div>
                  <h3>Tour Information</h3>
                  <p>Tell visitors what makes your food tour special.</p>
                </div>
              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-title">Tour Title *</label>
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
                <label htmlFor="tour-description">Description *</label>
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
                  <label htmlFor="tour-category">Food Tour Category *</label>
                  <select
                    id="tour-category"
                    name="tour_category"
                    value={formData.tour_category}
                    onChange={handleChange}
                    required
                    disabled={categoriesLoading || categories.length === 0}
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select a food tour category'}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoryError && <small style={{ color: '#a33' }}>{categoryError}</small>}
                  {!categoriesLoading && !categoryError && categories.length === 0 && (
                    <small>No active food tour categories available.</small>
                  )}
                </div>

                <div className="create-tour-field">
                  <label htmlFor="tour-price">Price per Participant (SGD) *</label>
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

              <div className="create-tour-field-row">
                <div className="create-tour-field">
                  <label htmlFor="tour-city">City *</label>
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
            </div>

            <div className="create-tour-divider" />

            <div className="create-tour-section">
              <div className="create-tour-section-heading">
                <span className="create-tour-section-number">02</span>
                <div>
                  <h3>Tour Cover Image</h3>
                  <p>Upload an image to showcase your food tour to travellers.</p>
                </div>
              </div>

              <div className="create-tour-field">
                <label htmlFor="tour-image">Upload Image</label>
                <input
                  id="tour-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <small>JPG, PNG or WebP. Maximum file size: 5MB.</small>
              </div>

              {imagePreview && (
                <div style={{ marginTop: '16px', maxWidth: '420px' }}>
                  <img
                    src={imagePreview}
                    alt="Food tour preview"
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '1px solid #e7dcef',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      display: 'block',
                      marginTop: '10px',
                      padding: '9px 16px',
                      border: '1px solid #a33',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#a33',
                      cursor: 'pointer',
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="create-tour-divider" />

            <div className="create-tour-section">
              <div className="create-tour-section-heading">
                <span className="create-tour-section-number">03</span>
                <div>
                  <h3>Schedule &amp; Capacity</h3>
                  <p>Add multiple dates and time slots for your food tour.</p>
                </div>
              </div>

              {sessions.map((session, index) => (
                <div
                  className="create-tour-session-card"
                  key={index}
                  style={{
                    border: '1px solid #e7dcef',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <h4>Session {index + 1}</h4>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSession(index)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#a33',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="create-tour-field">
                    <label htmlFor={`tour-date-${index}`}>Tour Date *</label>
                    <input
                      id={`tour-date-${index}`}
                      type="date"
                      name="date"
                      value={session.date}
                      onChange={(event) => handleSessionChange(index, event)}
                      required
                    />
                  </div>

                  <div className="create-tour-field-row">
                    <div className="create-tour-field">
                      <label htmlFor={`tour-start-time-${index}`}>Start Time *</label>
                      <input
                        id={`tour-start-time-${index}`}
                        type="time"
                        name="start_time"
                        value={session.start_time}
                        onChange={(event) => handleSessionChange(index, event)}
                        required
                      />
                    </div>
                    <div className="create-tour-field">
                      <label htmlFor={`tour-end-time-${index}`}>End Time *</label>
                      <input
                        id={`tour-end-time-${index}`}
                        type="time"
                        name="end_time"
                        value={session.end_time}
                        onChange={(event) => handleSessionChange(index, event)}
                        required
                      />
                    </div>
                  </div>

                  <div className="create-tour-field">
                    <label htmlFor={`tour-capacity-${index}`}>Maximum Participants *</label>
                    <input
                      id={`tour-capacity-${index}`}
                      type="number"
                      name="capacity"
                      min="1"
                      step="1"
                      placeholder="e.g. 12"
                      value={session.capacity}
                      onChange={(event) => handleSessionChange(index, event)}
                      required
                    />
                    <small>Maximum number of guests for this session.</small>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSession}
                style={{
                  padding: '12px 20px',
                  border: '1px dashed #7650a5',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#7650a5',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                + Add Another Session
              </button>
            </div>

            <div className="create-tour-submit-area">
              <button
                type="button"
                className="create-tour-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="create-tour-submit-btn"
                disabled={loading || categoriesLoading || categories.length === 0}
              >
                {loading ? 'Creating Tour...' : 'Publish Food Tour'}
              </button>
              <p>Please review your tour details and sessions before publishing.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateFoodTour;
