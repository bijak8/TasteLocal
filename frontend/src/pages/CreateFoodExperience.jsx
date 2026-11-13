
import { useEffect, useState } from 'react';
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

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Experience category states
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');

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

  // Generate and clean up image preview URL.
  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  // Fetch active experience categories from Django.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('categories/experience/');

        const categoryData = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setCategories(
          categoryData.filter((category) => category.is_active)
        );

      } catch (error) {
        console.error('Error fetching experience categories:', error);
        setCategoryError('Unable to load experience categories.');
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

  // Handle cover image selection.
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

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

    const fileInput = document.getElementById(
      'experience-image'
    );

    if (fileInput) {
      fileInput.value = '';
    }
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
      previousSessions.filter(
        (_, sessionIndex) => sessionIndex !== index
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validate category selection.
    if (!formData.category) {
      setError('Please select an experience category.');
      return;
    }

    // Validate price.
    if (formData.price === '' || Number(formData.price) < 0) {
      setError('Please enter a valid experience price.');
      return;
    }

    // Validate availability sessions.
    for (let index = 0; index < sessions.length; index++) {
      const session = sessions[index];

      if (
        !session.date ||
        !session.start_time ||
        !session.end_time ||
        !session.capacity
      ) {
        setError(
          `Please complete all fields in Session ${index + 1}.`
        );
        return;
      }

      if (session.end_time <= session.start_time) {
        setError(
          `Session ${index + 1}: End time must be later than start time.`
        );
        return;
      }

      if (Number(session.capacity) < 1) {
        setError(
          `Session ${index + 1}: Capacity must be at least 1.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const firstSession = sessions[0];

      // Prepare the main experience details.
      const experienceData = {
        ...formData,
        price: Number(formData.price),
        date: firstSession.date,
        start_time: firstSession.start_time,
        end_time: firstSession.end_time,
        capacity: Number(firstSession.capacity),
      };

      // Use FormData so Django can receive the image.
      const data = new FormData();

      Object.entries(experienceData).forEach(([key, value]) => {
        // Do not send empty optional GPS coordinates.
        if (
          (key === 'latitude' || key === 'longitude') &&
          value === ''
        ) {
          return;
        }

        data.append(key, value);
      });

      // Attach cover image if selected.
      if (image) {
        data.append('image', image);
      }

      // First create the food experience.
      const response = await API.post(
        'food-experiences/create/',
        data
      );

      const foodExperienceId = response.data.id;

      // Then create each availability session.
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

        {/* Dashboard Heading */}
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

          {/* Form Heading */}
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

                  <select
                    id="experience-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={
                      categoriesLoading ||
                      categories.length === 0
                    }
                  >
                    <option value="">
                      {categoriesLoading
                        ? 'Loading categories...'
                        : 'Select an experience category'}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {categoryError && (
                    <small style={{ color: '#a33' }}>
                      {categoryError}
                    </small>
                  )}

                  {!categoriesLoading &&
                    !categoryError &&
                    categories.length === 0 && (
                      <small>
                        No active experience categories available.
                      </small>
                    )}
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

            {/* Section 2: Cover Image */}
            <div className="create-experience-section">

              <div className="create-experience-section-heading">
                <span>02</span>

                <div>
                  <h3>Experience Cover Image</h3>
                  <p>
                    Upload a beautiful image to showcase your experience
                    to travellers.
                  </p>
                </div>
              </div>

              <div className="create-experience-field">
                <label htmlFor="experience-image">
                  Upload Image
                </label>

                <input
                  id="experience-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                <small>
                  JPG, PNG or WebP. Maximum file size: 5MB.
                </small>
              </div>

              {imagePreview && (
                <div
                  className="experience-image-preview"
                  style={{
                    marginTop: '16px',
                    maxWidth: '420px',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Food experience preview"
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

            {/* Section 3: Schedule and Capacity */}
            <div className="create-experience-section">

              <div className="create-experience-section-heading">
                <span>03</span>

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

            {/* Section 4: Location */}
            <div className="create-experience-section">

              <div className="create-experience-section-heading">
                <span>04</span>

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
                  <label htmlFor="experience-city">
                    City
                  </label>

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
                  <label htmlFor="experience-area">
                    Area
                  </label>

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

            {/* Form Actions */}
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
                disabled={loading || categoriesLoading || categories.length === 0}
              >
                {loading
                  ? 'Publishing...'
                  : 'Publish Food Experience'}
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
