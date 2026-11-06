
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get('type') || 'experience';

  const [bookingType, setBookingType] = useState(initialType);

  const [formData, setFormData] = useState({
    food_experience: initialType === 'experience'
      ? searchParams.get('id') || ''
      : '',
    food_tour: initialType === 'tour'
      ? searchParams.get('id') || ''
      : '',
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

      // Redirect to booking history after successful submission
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">

          <div className="card shadow-sm">
            <div className="card-body p-4">

              <h2 className="fw-bold text-center mb-2">
                Make a Booking
              </h2>

              <p className="text-secondary text-center mb-4">
                Submit your booking request through TasteLocal.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    Booking Type
                  </label>

                  <select
                    className="form-select"
                    value={bookingType}
                    onChange={handleTypeChange}
                  >
                    <option value="experience">
                      Food Experience
                    </option>

                    <option value="tour">
                      Food Tour
                    </option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {bookingType === 'experience'
                      ? 'Food Experience ID'
                      : 'Food Tour ID'}
                  </label>

                  <input
                    type="number"
                    className="form-control"
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
                    required
                  />

                  <small className="text-secondary">
                    You can find the ID in the experience or tour URL.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Number of Participants
                  </label>

                  <input
                    type="number"
                    name="number_of_participants"
                    className="form-control"
                    value={formData.number_of_participants}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Special Requests (Optional)
                  </label>

                  <textarea
                    name="special_request"
                    className="form-control"
                    rows="3"
                    value={formData.special_request}
                    onChange={handleChange}
                    placeholder="Dietary requirements or other requests..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100"
                  disabled={loading}
                >
                  {loading
                    ? 'Submitting...'
                    : 'Submit Booking Request'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Booking;
