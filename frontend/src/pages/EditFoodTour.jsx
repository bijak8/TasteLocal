import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

function EditFoodTour() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tour_category: '',
    city: '',
    area: '',
    price: '',
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  const [existingImage, setExistingImage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const [tourResponse, sessionsResponse] = await Promise.all([
          API.get(`operator/food-tours/${id}/`),
          API.get('operator/availability-sessions/'),
        ]);

        const tour = tourResponse.data;

        setFormData({
          title: tour.title || '',
          description: tour.description || '',
          // The FoodTourSerializer exposes tour_category as a primary-key value.
          tour_category: tour.tour_category ? String(tour.tour_category) : '',
          city: tour.city || '',
          area: tour.area || '',
          price: tour.price ?? '',
        });

        setExistingImage(tour.image || '');

        const allSessions = Array.isArray(sessionsResponse.data)
          ? sessionsResponse.data
          : sessionsResponse.data.results || [];

        const tourSessions = allSessions
          .filter((session) => Number(session.food_tour) === Number(id))
          .map((session) => ({
            ...session,
            date: session.date || '',
            start_time: session.start_time?.slice(0, 5) || '',
            end_time: session.end_time?.slice(0, 5) || '',
            capacity: session.capacity ?? '',
            isNew: false,
          }));

        setSessions(tourSessions);
      } catch (fetchError) {
        console.error('Error fetching food tour:', fetchError);
        setError(
          fetchError.response?.data?.detail || 'Unable to load food tour.'
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

  const handleSessionChange = (index, field, value) => {
    setSessions((previousSessions) =>
      previousSessions.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, [field]: value } : session
      )
    );
  };

  const handleAddSession = () => {
    setSessions((previousSessions) => [
      ...previousSessions,
      {
        tempId: `new-${Date.now()}`,
        date: '',
        start_time: '',
        end_time: '',
        capacity: '',
        remaining_seats: null,
        is_active: true,
        isNew: true,
      },
    ]);
  };

  const handleRemoveSession = (index) => {
    setSessions((previousSessions) =>
      previousSessions
        .map((session, sessionIndex) => {
          if (sessionIndex !== index) return session;
          if (session.isNew) return null;
          return { ...session, is_active: false };
        })
        .filter(Boolean)
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

    const activeSessions = sessions.filter((session) => session.is_active);

    for (let index = 0; index < activeSessions.length; index += 1) {
      const session = activeSessions[index];

      if (!session.date || !session.start_time || !session.end_time || !session.capacity) {
        setError(`Please complete all fields for session ${index + 1}.`);
        return;
      }

      if (session.end_time <= session.start_time) {
        setError(`End time must be later than start time for session ${index + 1}.`);
        return;
      }

      if (Number(session.capacity) < 1) {
        setError(`Capacity must be at least 1 for session ${index + 1}.`);
        return;
      }
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('tour_category', Number(formData.tour_category));
      data.append('city', formData.city);
      data.append('area', formData.area);
      data.append('price', Number(formData.price));

      // Only send image when a replacement has been selected.
      if (image) data.append('image', image);

      await API.patch(`operator/food-tours/${id}/`, data);

      for (const session of sessions) {
        const sessionData = {
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          capacity: Number(session.capacity),
          is_active: session.is_active,
        };

        if (session.isNew) {
          await API.post('operator/availability-sessions/', {
            ...sessionData,
            food_tour: Number(id),
          });
        } else {
          await API.patch(
            `operator/availability-sessions/${session.id}/`,
            sessionData
          );
        }
      }

      alert('Food tour updated successfully!');
      navigate('/operator/dashboard');
    } catch (submitError) {
      console.error('Error updating food tour:', submitError);
      setError(
        submitError.response?.data
          ? JSON.stringify(submitError.response.data)
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
          <span className="edit-tour-eyebrow">TOUR OPERATOR</span>
          <h1>Edit Food Tour</h1>
          <p>Update your tour details, schedule and location.</p>
        </div>

        <div className="edit-tour-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="edit-tour-error" role="alert">{error}</div>}

            <section className="edit-tour-section">
              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">01</span>
                <div>
                  <h2>Basic Information</h2>
                  <p>Tell travellers about your food tour.</p>
                </div>
              </div>

              <div className="edit-tour-field">
                <label htmlFor="title">Tour Title *</label>
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
                <label htmlFor="description">Description *</label>
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

              <div className="edit-tour-field-row">
                <div className="edit-tour-field">
                  <label htmlFor="tour_category">Food Tour Category *</label>
                  <select
                    id="tour_category"
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

                <div className="edit-tour-field">
                  <label htmlFor="price">Price per Person (SGD) *</label>
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
              </div>
            </section>

            <div className="edit-tour-divider"></div>

            <section className="edit-tour-section">
              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">02</span>
                <div>
                  <h2>Tour Cover Image</h2>
                  <p>View your current image or upload a replacement.</p>
                </div>
              </div>

              {imagePreview || existingImage ? (
                <div style={{ marginBottom: '18px', maxWidth: '460px' }}>
                  <img
                    src={imagePreview || existingImage}
                    alt="Food tour cover"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '260px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '1px solid #e7dcef',
                    }}
                  />
                  <small>{image ? 'New image selected' : 'Current food tour image'}</small>
                </div>
              ) : (
                <p>No cover image has been uploaded for this tour.</p>
              )}

              <div className="edit-tour-field">
                <label htmlFor="tour-image">Upload Replacement Image</label>
                <input
                  id="tour-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <small>JPG, PNG or WebP. Maximum file size: 5MB.</small>
              </div>
            </section>

            <div className="edit-tour-divider"></div>

            <section className="edit-tour-section">
              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">03</span>
                <div>
                  <h2>Availability Sessions</h2>
                  <p>Manage all available dates and booking time slots.</p>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="text-secondary mb-0">{sessions.length} session(s)</p>
                <button
                  type="button"
                  className="edit-tour-cancel-btn"
                  onClick={handleAddSession}
                >
                  + Add Session
                </button>
              </div>

              {sessions.length === 0 && (
                <div className="edit-tour-empty">
                  No availability sessions found. Add a session to get started.
                </div>
              )}

              {sessions.map((session, index) => (
                <div key={session.id || session.tempId} className="edit-session-card">
                  <div className="edit-session-heading">
                    <div>
                      <h3>Session {index + 1}</h3>
                      {session.isNew && <span className="edit-session-status new">New</span>}
                      {!session.is_active && <span className="edit-session-status inactive">Inactive</span>}
                    </div>
                    {session.is_active && (
                      <button
                        type="button"
                        className="edit-session-deactivate"
                        onClick={() => handleRemoveSession(index)}
                      >
                        {session.isNew ? 'Remove' : 'Deactivate'}
                      </button>
                    )}
                  </div>

                  <div className="edit-tour-field">
                    <label htmlFor={`session-date-${index}`}>Session Date</label>
                    <input
                      id={`session-date-${index}`}
                      type="date"
                      value={session.date}
                      onChange={(event) => handleSessionChange(index, 'date', event.target.value)}
                      disabled={!session.is_active}
                      required={session.is_active}
                    />
                  </div>

                  <div className="edit-tour-field-row">
                    <div className="edit-tour-field">
                      <label htmlFor={`session-start-${index}`}>Start Time</label>
                      <input
                        id={`session-start-${index}`}
                        type="time"
                        value={session.start_time}
                        onChange={(event) => handleSessionChange(index, 'start_time', event.target.value)}
                        disabled={!session.is_active}
                        required={session.is_active}
                      />
                    </div>
                    <div className="edit-tour-field">
                      <label htmlFor={`session-end-${index}`}>End Time</label>
                      <input
                        id={`session-end-${index}`}
                        type="time"
                        value={session.end_time}
                        onChange={(event) => handleSessionChange(index, 'end_time', event.target.value)}
                        disabled={!session.is_active}
                        required={session.is_active}
                      />
                    </div>
                  </div>

                  <div className="edit-tour-field">
                    <label htmlFor={`session-capacity-${index}`}>Maximum Participants</label>
                    <input
                      id={`session-capacity-${index}`}
                      type="number"
                      min="1"
                      value={session.capacity}
                      onChange={(event) => handleSessionChange(index, 'capacity', event.target.value)}
                      disabled={!session.is_active}
                      required={session.is_active}
                    />
                  </div>

                  {!session.isNew && (
                    <p className="edit-session-remaining">
                      Remaining seats: {session.remaining_seats}
                    </p>
                  )}
                </div>
              ))}
            </section>

            <div className="edit-tour-divider"></div>

            <section className="edit-tour-section">
              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">04</span>
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

            <div className="edit-tour-actions">
              <button
                type="button"
                className="edit-tour-cancel-btn"
                onClick={() => navigate('/operator/dashboard')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="edit-tour-save-btn"
                disabled={saving || categoriesLoading || categories.length === 0}
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
