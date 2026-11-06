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

  // Fetch tourist profile
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

  // Handle form changes
  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  // Update tourist profile
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
      <div className="container py-5 text-center">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">

              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">
                  My Profile
                </h2>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/tourist/dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>

              <p className="text-muted mb-4">
                View and update your personal information.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Username */}
                <div className="mb-3">
                  <label className="form-label">
                    Username
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    disabled
                  />

                  <small className="text-muted">
                    Your username cannot be changed.
                  </small>
                </div>

                {/* First Name */}
                <div className="mb-3">
                  <label className="form-label">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="mb-3">
                  <label className="form-label">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="form-label">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving Changes...'
                    : 'Update Profile'}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TouristProfile;
