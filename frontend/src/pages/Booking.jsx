import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useTranslation } from 'react-i18next';
function Booking() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('bm') ? 'bm' : 'en';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const experienceId = searchParams.get('food_experience');
  const tourId = searchParams.get('food_tour');
  const genericId = searchParams.get('id');
  const requestedSessionId = searchParams.get('availability_session');
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
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(
    requestedSessionId || ''
  );
  const [price, setPrice] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const itemId =
    bookingType === 'experience'
      ? formData.food_experience
      : formData.food_tour;
  // Retrieve listing price and available sessions
  useEffect(() => {
    if (!itemId || Number(itemId) < 1) {
      setSessions([]);
      setSelectedSession('');
      setPrice(null);
      setSessionError('');
      return;
    }
    let cancelled = false;
    const fetchBookingDetails = async () => {
      setSessionsLoading(true);
      setSessionError('');
      setSessions([]);
      setPrice(null);
      try {
        const endpoint =
          bookingType === 'experience'
            ? 'food-experiences/'
            : 'food-tours/';
        const [sessionResponse, listingResponse] = await Promise.all([
          API.get(`${endpoint}${itemId}/availability/`),
          API.get(`${endpoint}${itemId}/`),
        ]);
        if (cancelled) return;
        const sessionData = Array.isArray(sessionResponse.data)
          ? sessionResponse.data
          : sessionResponse.data.results || [];
        setSessions(sessionData);
        setPrice(Number(listingResponse.data.price));
        const matchingSession = sessionData.find(
          (session) => String(session.id) === String(requestedSessionId)
        );
        if (matchingSession) {
          setSelectedSession(String(matchingSession.id));
        } else {
          setSelectedSession('');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Unable to retrieve booking details:', err);
        setSessionError(
          t('booking.sessionLoadError')
        );
        setSelectedSession('');
      } finally {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    };
    fetchBookingDetails();
    return () => {
      cancelled = true;
    };
  }, [bookingType, itemId, requestedSessionId]);
  const selectedSessionDetails = sessions.find(
    (session) => String(session.id) === String(selectedSession)
  );
  const participants = Number(formData.number_of_participants) || 0;
  const totalPrice =
    price !== null && participants > 0
      ? price * participants
      : null;
  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString(language === 'bm' ? 'ms-MY' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString(language === 'bm' ? 'ms-MY' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  const handleTypeChange = (event) => {
    const type = event.target.value;
    setBookingType(type);
    setFormData((previous) => ({
      ...previous,
      food_experience: '',
      food_tour: '',
    }));
    setSelectedSession('');
  };
  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!localStorage.getItem('accessToken')) {
      setError(t('booking.loginRequired'));
      return;
    }
    if (!itemId) {
      setError(
        bookingType === 'experience'
          ? t('booking.experienceIdRequired')
          : t('booking.tourIdRequired')
      );
      return;
    }
    if (!selectedSession) {
      setError(t('booking.sessionRequired'));
      return;
    }
    if (participants < 1) {
      setError(t('booking.participantsMinimum'));
      return;
    }
    setLoading(true);
    const bookingData = {
      food_experience:
        bookingType === 'experience' ? Number(itemId) : null,
      food_tour:
        bookingType === 'tour' ? Number(itemId) : null,
      availability_session: Number(selectedSession),
      number_of_participants: participants,
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
        setError(
          t('booking.sessionExpired')
        );
      } else if (error.response?.data) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError(t('booking.submitError'));
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
            <span className="booking-eyebrow">{t('booking.eyebrow')}</span>
            <h1>{t('booking.title')}</h1>
            <p>
              {t('booking.subtitle')}
            </p>
          </div>
          <div className="booking-intro">
            <div className="booking-intro-icon">✦</div>
            <div>
              <h3>{t('booking.introTitle')}</h3>
              <p>
                {t('booking.introDescription')}
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
              <label htmlFor="booking-type">{t('booking.bookingType')}</label>
              <select
                id="booking-type"
                value={bookingType}
                onChange={handleTypeChange}
              >
                <option value="experience">{t('booking.foodExperience')}</option>
                <option value="tour">{t('booking.foodTour')}</option>
              </select>
            </div>
            <div className="booking-field">
              <label htmlFor="booking-item-id">
                {bookingType === 'experience'
                  ? t('booking.foodExperienceId')
                  : t('booking.foodTourId')}
              </label>
              <input
                id="booking-item-id"
                type="number"
                name={
                  bookingType === 'experience'
                    ? 'food_experience'
                    : 'food_tour'
                }
                value={itemId}
                onChange={handleChange}
                min="1"
                placeholder={t('booking.enterId')}
                required
              />
              <span className="booking-field-hint">
                {t('booking.idHint')}
              </span>
            </div>
            <div className="booking-field">
              <label htmlFor="booking-session">
                {t('booking.selectSession')}
              </label>
              <select
                id="booking-session"
                value={selectedSession}
                onChange={(event) =>
                  setSelectedSession(event.target.value)
                }
                disabled={sessionsLoading || sessions.length === 0}
                required
              >
                <option value="">
                  {sessionsLoading
                    ? t('booking.loadingSessions')
                    : sessions.length === 0
                      ? t('booking.noAvailableSessions')
                      : t('booking.chooseDateTime')}
                </option>
                {sessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                    disabled={
                      Number(session.remaining_seats) <= 0
                    }
                  >
                    {formatDate(session.date)} —{' '}
                    {formatTime(session.start_time)} {t('booking.until')}{' '}
                    {formatTime(session.end_time)} —{' '}
                    {session.remaining_seats} {t('booking.seatsRemaining')}
                  </option>
                ))}
              </select>
              {sessionError && (
                <span className="booking-field-hint">
                  {sessionError}
                </span>
              )}
              {selectedSessionDetails && (
                <div className="booking-session-summary">
                  <strong>{t('booking.selectedSession')}</strong>
                  <p>
                    {formatDate(selectedSessionDetails.date)}
                  </p>
                  <p>
                    {formatTime(selectedSessionDetails.start_time)}
                    {' '}{t('booking.until')}{' '}
                    {formatTime(selectedSessionDetails.end_time)}
                  </p>
                  <p>
                    {selectedSessionDetails.remaining_seats} {t('booking.seatsRemaining')}
                  </p>
                </div>
              )}
            </div>
            <div className="booking-field">
              <label htmlFor="booking-participants">
                {t('booking.numberOfParticipants')}
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
            <div className="booking-price-summary">
              <div className="booking-price-row">
                <span>{t('booking.pricePerParticipant')}</span>
                <strong>
                  {price !== null
                    ? `SGD ${price.toFixed(2)}`
                    : '—'}
                </strong>
              </div>
              <div className="booking-price-row">
                <span>{t('booking.numberOfParticipants')}</span>
                <strong>{participants}</strong>
              </div>
              <div className="booking-price-total">
                <span>{t('booking.totalAmount')}</span>
                <strong>
                  {totalPrice !== null
                    ? `SGD ${totalPrice.toFixed(2)}`
                    : '—'}
                </strong>
              </div>
            </div>
            <div className="booking-field">
              <label htmlFor="booking-special-request">
                {t('booking.specialRequests')} <span>({t('booking.optional')})</span>
              </label>
              <textarea
                id="booking-special-request"
                name="special_request"
                rows="4"
                value={formData.special_request}
                onChange={handleChange}
                placeholder={t('booking.specialRequestsPlaceholder')}
              />
            </div>
            <button
              type="submit"
              className="booking-submit-btn"
              disabled={
                loading ||
                sessionsLoading ||
                !selectedSession ||
                price === null
              }
            >
              {loading
                ? t('booking.submitting')
                : t('booking.submitRequest')}
            </button>
          </form>
          <p className="booking-note">
            {t('booking.confirmationNote')}
          </p>
        </div>
      </div>
    </section>
  );
}
export default Booking;
