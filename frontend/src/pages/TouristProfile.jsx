
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function TouristProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get('tourist/profile/');

      setFormData({
        username: response.data.username || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);

      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.detail ||
        'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await API.patch(
        'tourist/profile/',
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }
      );

      setFormData({
        username: response.data.username || formData.username,
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
      });

      setSuccess('Your profile has been updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);

      const errorData = err.response?.data;

      setError(
        typeof errorData === 'object'
          ? JSON.stringify(errorData)
          : 'Unable to update your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="tourist-profile-page">
        <div className="profile-loading">
          <div className="profile-loader"></div>
          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="tourist-profile-page">
      <div className="tourist-profile-container">

        <div className="profile-page-heading">
          <div>
            <span className="profile-eyebrow">
              YOUR TASTELOCAL ACCOUNT
            </span>
            <h1>My Profile</h1>
            <p>
              Keep your personal information up to date
              for your TasteLocal account.
            </p>
          </div>

          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate('/tourist/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="profile-content-card">

          <div className="profile-card-heading">
            <div className="profile-avatar">
              {formData.first_name
                ? formData.first_name.charAt(0).toUpperCase()
                : 'T'}
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Manage your account details below.</p>
            </div>
          </div>

          {error && (
            <div className="profile-alert profile-alert-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="profile-alert profile-alert-success" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="profile-form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                disabled
              />
              <small>Your username cannot be changed.</small>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Update Profile'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}

export default TouristProfile;
