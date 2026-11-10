
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
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
  });

  const [sessions, setSessions] = useState([
    {
      date: '',
      start_time: '',
      end_time: '',
      capacity: '',
    },
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSessionChange = (index, event) => {
    const { name, value } = event.target;

    setSessions((previousSessions) =>
      previousSessions.map((session, sessionIndex) =>
        sessionIndex === index
          ? { ...session, [name]: value }
          : session
      )
    );
  };

  const addSession = () => {
    setSessions((previousSessions) => [
      ...previousSessions,
      {
        date: '',
        start_time: '',
        end_time: '',
        capacity: '',
      },
    ]);
  };

  const removeSession = (index) => {
    if (sessions.length === 1) {
      return;
    }

    setSessions((previousSessions) =>
      previousSessions.filter((_, sessionIndex) => sessionIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    for (let index = 0; index < sessions.length; index++) {
      const session = sessions[index];

      if (
        !session.date ||
        !session.start_time ||
        !session.end_time ||
        !session.capacity
      ) {
        setError(`Please complete all fields in Session ${index + 1}.`);
        return;
      }

      if (session.end_time <= session.start_time) {
        setError(
          `Session ${index + 1}: End time must be later than start time.`
        );
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

      // Keep the existing listing fields compatible with the serializer.
      const experienceData = {
        ...formData,
        price: Number(formData.price),
        date: firstSession.date,
        start_time: firstSession.start_time,
        end_time: firstSession.end_time,
        capacity: Number(firstSession.capacity),
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      // First create the food experience.
      const response = await API.post(
        'food-experiences/create/',
        experienceData
      );

      const foodExperienceId = response.data.id;

      // Then create each availability session for this experience.
      for (const session of sessions) {
        await API.post('vendor/availability-sessions/', {
          food_experience: foodExperienceId,
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          capacity: Number(session.capacity),
        });
      }

      console.log('Food experience created:', response.data);

      alert(
        'Food experience and availability sessions created successfully!'
      );

      navigate('/food-experiences');

    } catch (error) {
      console.error(
        'Error creating food experience or sessions:',
        error
      );

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to complete the food experience creation. Please try again.'
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
              <p>
                Complete the information below to publish your experience.
              </p>
            </div>
          </div>

          {error && (
            <div className="create-experience-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Section 1: Basic Information */}
            <div className="create-experience-section">

              <div className="create-experience-section-heading">
                <span>01</span>

                <div>
                  <h3>Basic Information</h3>
                  <p>
                    Tell travellers what makes your experience special.
                  </p>
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

            {/* Section 2: Schedule and Capacity */}
            <div className="create-experience-section">

              <div className="create-experience-section-heading">
                <span>02</span>

                <div>
                  <h3>Schedule and Capacity</h3>
                  <p>
                    Add multiple dates and time slots for your experience.
                  </p>
                </div>
              </div>

              {sessions.map((session, index) => (
                <div
                  className="create-experience-session-card"
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

                  <div className="create-experience-field">
                    <label htmlFor={`experience-date-${index}`}>
                      Date *
                    </label>

                    <input
                      id={`experience-date-${index}`}
                      type="date"
                      name="date"
                      value={session.date}
                      onChange={(event) =>
                        handleSessionChange(index, event)
                      }
                      required
                    />
                  </div>

                  <div className="create-experience-form-grid">

                    <div className="create-experience-field">
                      <label htmlFor={`experience-start-time-${index}`}>
                        Start Time *
                      </label>

                      <input
                        id={`experience-start-time-${index}`}
                        type="time"
                        name="start_time"
                        value={session.start_time}
                        onChange={(event) =>
                          handleSessionChange(index, event)
                        }
                        required
                      />
                    </div>

                    <div className="create-experience-field">
                      <label htmlFor={`experience-end-time-${index}`}>
                        End Time *
                      </label>

                      <input
                        id={`experience-end-time-${index}`}
                        type="time"
                        name="end_time"
                        value={session.end_time}
                        onChange={(event) =>
                          handleSessionChange(index, event)
                        }
                        required
                      />
                    </div>

                  </div>

                  <div className="create-experience-field">
                    <label htmlFor={`experience-capacity-${index}`}>
                      Maximum Participants *
                    </label>

                    <input
                      id={`experience-capacity-${index}`}
                      type="number"
                      name="capacity"
                      min="1"
                      step="1"
                      placeholder="e.g. 10"
                      value={session.capacity}
                      onChange={(event) =>
                        handleSessionChange(index, event)
                      }
                      required
                    />

                    <small>
                      Maximum number of guests for this session.
                    </small>
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

            {/* Section 3: Location */}
            <div className="create-experience-section">

              <div className="create-experience-section-heading">
                <span>03</span>

                <div>
                  <h3>Location</h3>
                  <p>
                    Help travellers find where your experience takes place.
                  </p>
                </div>
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-address">
                  Address *
                </label>

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
