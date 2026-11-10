
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
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
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

      // Keep the existing listing fields compatible with the serializer.
      const tourData = {
        ...formData,
        price: Number(formData.price),
        date: firstSession.date,
        start_time: firstSession.start_time,
        end_time: firstSession.end_time,
        capacity: Number(firstSession.capacity),
      };

      // First create the food tour.
      const response = await API.post('food-tours/create/', tourData);

      const foodTourId = response.data.id;

      // Then create each availability session for this tour.
      for (const session of sessions) {
        await API.post('operator/availability-sessions/', {
          food_tour: foodTourId,
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          capacity: Number(session.capacity),
        });
      }

      console.log('Food tour created:', response.data);

      alert('Food tour and availability sessions created successfully!');
      navigate('/food-tours');

    } catch (error) {
      console.error('Error creating food tour or sessions:', error);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Unable to complete the food tour creation. Please try again.'
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
                  <p>
                    Add multiple dates and time slots for your food tour.
                  </p>
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
                    <label htmlFor={`tour-date-${index}`}>
                      Tour Date
                    </label>

                    <input
                      id={`tour-date-${index}`}
                      type="date"
                      name="date"
                      value={session.date}
                      onChange={(event) =>
                        handleSessionChange(index, event)
                      }
                      required
                    />
                  </div>

                  <div className="create-tour-field-row">

                    <div className="create-tour-field">
                      <label htmlFor={`tour-start-time-${index}`}>
                        Start Time
                      </label>

                      <input
                        id={`tour-start-time-${index}`}
                        type="time"
                        name="start_time"
                        value={session.start_time}
                        onChange={(event) =>
                          handleSessionChange(index, event)
                        }
                        required
                      />
                    </div>

                    <div className="create-tour-field">
                      <label htmlFor={`tour-end-time-${index}`}>
                        End Time
                      </label>

                      <input
                        id={`tour-end-time-${index}`}
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

                  <div className="create-tour-field">
                    <label htmlFor={`tour-capacity-${index}`}>
                      Maximum Participants
                    </label>

                    <input
                      id={`tour-capacity-${index}`}
                      type="number"
                      name="capacity"
                      min="1"
                      step="1"
                      placeholder="e.g. 12"
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
                Please review your tour details and sessions before publishing.
              </p>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default CreateFoodTour;
