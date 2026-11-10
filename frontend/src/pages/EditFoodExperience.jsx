
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
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [experienceResponse, sessionsResponse] =
          await Promise.all([
            API.get(`vendor/food-experiences/${id}/`),
            API.get('vendor/availability-sessions/'),
          ]);

        const experience = experienceResponse.data;

        setFormData({
          title: experience.title || '',
          description: experience.description || '',
          category: experience.category || '',
          price: experience.price ?? '',
          address: experience.address || '',
          city: experience.city || '',
          area: experience.area || '',
          latitude: experience.latitude ?? '',
          longitude: experience.longitude ?? '',
        });

        const allSessions = Array.isArray(sessionsResponse.data)
          ? sessionsResponse.data
          : sessionsResponse.data.results || [];

        const experienceSessions = allSessions
          .filter(
            (session) =>
              Number(session.food_experience) === Number(id)
          )
          .map((session) => ({
            ...session,
            date: session.date || '',
            start_time: session.start_time?.slice(0, 5) || '',
            end_time: session.end_time?.slice(0, 5) || '',
            capacity: session.capacity ?? '',
            isNew: false,
          }));

        setSessions(experienceSessions);

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

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSessionChange = (index, field, value) => {
    setSessions((previousSessions) =>
      previousSessions.map((session, sessionIndex) =>
        sessionIndex === index
          ? { ...session, [field]: value }
          : session
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

          return {
            ...session,
            is_active: false,
          };
        })
        .filter(Boolean)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const activeSessions = sessions.filter(
      (session) => session.is_active
    );

    for (let index = 0; index < activeSessions.length; index++) {
      const session = activeSessions[index];

      if (
        !session.date ||
        !session.start_time ||
        !session.end_time ||
        !session.capacity
      ) {
        setError(
          `Please complete all fields for session ${index + 1}.`
        );
        return;
      }

      if (session.end_time <= session.start_time) {
        setError(
          `End time must be later than start time for session ${index + 1}.`
        );
        return;
      }

      if (Number(session.capacity) < 1) {
        setError(
          `Capacity must be at least 1 for session ${index + 1}.`
        );
        return;
      }
    }

    setSaving(true);

    const experienceData = {
      ...formData,
      price: Number(formData.price),
      latitude:
        formData.latitude === ''
          ? null
          : Number(formData.latitude),
      longitude:
        formData.longitude === ''
          ? null
          : Number(formData.longitude),
    };

    try {
      await API.patch(
        `vendor/food-experiences/${id}/`,
        experienceData
      );

      for (const session of sessions) {
        const sessionData = {
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          capacity: Number(session.capacity),
          is_active: session.is_active,
        };

        if (session.isNew) {
          await API.post(
            'vendor/availability-sessions/',
            {
              ...sessionData,
              food_experience: Number(id),
            }
          );
        } else {
          await API.patch(
            `vendor/availability-sessions/${session.id}/`,
            sessionData
          );
        }
      }

      alert(
        'Food experience and availability sessions updated successfully!'
      );

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
      <div className="edit-tour-loading">
        <div className="edit-tour-spinner"></div>
        <p>Loading food experience...</p>
      </div>
    );
  }

  return (
    <div className="edit-tour-page">
      <div className="edit-tour-container">

        {/* Page Heading */}
        <div className="edit-tour-heading">
          <span className="edit-tour-eyebrow">
            FOOD VENDOR
          </span>

          <h1>Edit Food Experience</h1>

          <p>
            Update your food experience details, schedule and location.
          </p>
        </div>

        <div className="edit-tour-card">

          <form onSubmit={handleSubmit}>

            {error && (
              <div className="edit-tour-error">
                {error}
              </div>
            )}

            {/* 01 - Basic Information */}
            <section className="edit-tour-section">

              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">
                  01
                </span>

                <div>
                  <h2>Basic Information</h2>
                  <p>Tell travellers about your food experience.</p>
                </div>
              </div>

              <div className="edit-tour-field">
                <label htmlFor="title">
                  Experience Title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-tour-field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-tour-field">
                <label htmlFor="category">
                  Category
                </label>

                <input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-tour-field">
                <label htmlFor="price">
                  Price per Person (SGD)
                </label>

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
                    required
                  />
                </div>
              </div>

            </section>

            <div className="edit-tour-divider"></div>

            {/* 02 - Availability Sessions */}
            <section className="edit-tour-section">

              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">
                  02
                </span>

                <div>
                  <h2>Availability Sessions</h2>
                  <p>
                    Manage all available dates and booking time slots.
                  </p>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="text-secondary mb-0">
                  {sessions.length} session(s)
                </p>

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
                <div
                  key={session.id || session.tempId}
                  className="edit-session-card"
                >

                  <div className="edit-session-heading">
                    <div>
                      <h3>Session {index + 1}</h3>

                      {session.isNew && (
                        <span className="edit-session-status new">
                          New
                        </span>
                      )}

                      {!session.is_active && (
                        <span className="edit-session-status inactive">
                          Inactive
                        </span>
                      )}
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
                    <label>Session Date</label>

                    <input
                      type="date"
                      value={session.date}
                      onChange={(event) =>
                        handleSessionChange(
                          index,
                          'date',
                          event.target.value
                        )
                      }
                      disabled={!session.is_active}
                      required={session.is_active}
                    />
                  </div>

                  <div className="edit-tour-field-row">

                    <div className="edit-tour-field">
                      <label>Start Time</label>

                      <input
                        type="time"
                        value={session.start_time}
                        onChange={(event) =>
                          handleSessionChange(
                            index,
                            'start_time',
                            event.target.value
                          )
                        }
                        disabled={!session.is_active}
                        required={session.is_active}
                      />
                    </div>

                    <div className="edit-tour-field">
                      <label>End Time</label>

                      <input
                        type="time"
                        value={session.end_time}
                        onChange={(event) =>
                          handleSessionChange(
                            index,
                            'end_time',
                            event.target.value
                          )
                        }
                        disabled={!session.is_active}
                        required={session.is_active}
                      />
                    </div>

                  </div>

                  <div className="edit-tour-field">
                    <label>Maximum Participants</label>

                    <input
                      type="number"
                      min="1"
                      value={session.capacity}
                      onChange={(event) =>
                        handleSessionChange(
                          index,
                          'capacity',
                          event.target.value
                        )
                      }
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

            {/* 03 - Location */}
            <section className="edit-tour-section">

              <div className="edit-tour-section-heading">
                <span className="edit-tour-section-number">
                  03
                </span>

                <div>
                  <h2>Location</h2>
                  <p>Where will your food experience take place?</p>
                </div>
              </div>

              <div className="edit-tour-field">
                <label htmlFor="address">
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-tour-field-row">

                <div className="edit-tour-field">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="edit-tour-field">
                  <label htmlFor="area">
                    Area
                  </label>

                  <input
                    id="area"
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="edit-tour-field-row">

                <div className="edit-tour-field">
                  <label htmlFor="latitude">
                    Latitude (Optional)
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>

                <div className="edit-tour-field">
                  <label htmlFor="longitude">
                    Longitude (Optional)
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>

              </div>

            </section>

            {/* Form Actions */}
            <div className="edit-tour-actions">

              <button
                type="button"
                className="edit-tour-cancel-btn"
                onClick={() => navigate('/vendor/dashboard')}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="edit-tour-save-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving Changes...'
                  : 'Update Food Experience'}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default EditFoodExperience;
