
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

 const experienceId = searchParams.get('food_experience');
const tourId = searchParams.get('food_tour');
const genericId = searchParams.get('id');

const initialType =
  searchParams.get('type') ||
  (tourId ? 'tour' : 'experience');

const initialId =
  genericId ||
  (initialType === 'tour' ? tourId : experienceId) ||
  '';

const [bookingType, setBookingType] = useState(initialType);

const [formData, setFormData] = useState({
  food_experience: initialType === 'experience' ? initialId : '',
  food_tour: initialType === 'tour' ? initialId : '',
  number_of_participants: 1,
  special_request: '',
});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (event) => {
    const type = event.target.value;

    setBookingType(type);

    setFormData({
      ...formData,
      food_experience: '',
      food_tour: '',
    });
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!localStorage.getItem('accessToken')) {
      setError('Please log in before making a booking.');
      return;
    }

    if (
      bookingType === 'experience' &&
      !formData.food_experience
    ) {
      setError('Please enter a food experience ID.');
      return;
    }

    if (
      bookingType === 'tour' &&
      !formData.food_tour
    ) {
      setError('Please enter a food tour ID.');
      return;
    }

    if (Number(formData.number_of_participants) < 1) {
      setError('Number of participants must be at least 1.');
      return;
    }

    setLoading(true);

    const bookingData = {
      food_experience: bookingType === 'experience'
        ? Number(formData.food_experience)
        : null,

      food_tour: bookingType === 'tour'
        ? Number(formData.food_tour)
        : null,

      number_of_participants: Number(
        formData.number_of_participants
      ),

      special_request: formData.special_request,
    };

    try {
      const response = await API.post(
        'bookings/create/',
        bookingData
      );

      console.log('Booking created:', response.data);

      navigate('/my-bookings', { replace: true });

    } catch (error) {
      console.error('Booking error:', error);

      if (error.response?.status === 401) {
        setError('Your login session has expired. Please log in again.');
      } else if (error.response?.data) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError('Unable to submit booking. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-page">
      <div className="booking-container">
        <div className="booking-card">
          <div className="booking-heading">
            <span className="booking-eyebrow">PLAN YOUR EXPERIENCE</span>

            <h1>Make a Booking</h1>

            <p>
              You're one step closer to discovering authentic
              local food and memorable experiences.
            </p>
          </div>

          <div className="booking-intro">
            <div className="booking-intro-icon">✦</div>
            <div>
              <h3>Your next food adventure</h3>
              <p>
                Complete the details below to send your booking request.
              </p>
            </div>
          </div>

          {error && (
            <div className="booking-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="booking-field">
              <label htmlFor="booking-type">Booking Type</label>

              <select
                id="booking-type"
                value={bookingType}
                onChange={handleTypeChange}
              >
                <option value="experience">Food Experience</option>
                <option value="tour">Food Tour</option>
              </select>
            </div>

            <div className="booking-field">
              <label htmlFor="booking-item-id">
                {bookingType === 'experience'
                  ? 'Food Experience ID'
                  : 'Food Tour ID'}
              </label>

              <input
                id="booking-item-id"
                type="number"
                name={
                  bookingType === 'experience'
                    ? 'food_experience'
                    : 'food_tour'
                }
                value={
                  bookingType === 'experience'
                    ? formData.food_experience
                    : formData.food_tour
                }
                onChange={handleChange}
                min="1"
                placeholder="Enter the ID"
                required
              />

              <span className="booking-field-hint">
                Find the ID in the food experience or tour URL.
              </span>
            </div>

            <div className="booking-field">
              <label htmlFor="booking-participants">
                Number of Participants
              </label>

              <input
                id="booking-participants"
                type="number"
                name="number_of_participants"
                value={formData.number_of_participants}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="booking-field">
              <label htmlFor="booking-special-request">
                Special Requests <span>(Optional)</span>
              </label>

              <textarea
                id="booking-special-request"
                name="special_request"
                rows="4"
                value={formData.special_request}
                onChange={handleChange}
                placeholder="Dietary requirements or other requests..."
              />
            </div>

            <button
              type="submit"
              className="booking-submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </form>

          <p className="booking-note">
            Your booking request will be available in My Bookings
            after successful submission.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Booking;
