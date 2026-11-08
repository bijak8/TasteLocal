
import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const formatApiError = (data) => {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(formatApiError).join(' ');
    }

    if (data && typeof data === 'object') {
      return Object.entries(data)
        .map(([field, messages]) => {
          const fieldName = field
            .replaceAll('_', ' ')
            .replace(/^\w/, (letter) => letter.toUpperCase());

          return `${fieldName}: ${formatApiError(messages)}`;
        })
        .join('\n');
    }

    return 'Unable to change your password. Please try again.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (formData.new_password.length < 12) {
      setError('Your new password must contain at least 12 characters.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Your new passwords do not match.');
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError('Your new password must be different from your current password.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('password-change/', formData);

      setMessage(
        response.data.message ||
        'Your password has been changed successfully. Please log in again.'
      );

      // Clear the current browser's saved login information.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProfile');

      // Notify the Navbar that the user has logged out.
      window.dispatchEvent(new Event('authChange'));

      // Clear the password fields.
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

    } catch (error) {
      console.error('Change password error:', error);

      const responseData = error.response?.data;

      if (responseData) {
        setError(formatApiError(responseData));
      } else {
        setError('Unable to change your password. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-page">
      <div className="register-container">
        <div className="register-card">

          {/* Page Heading */}
          <div className="register-heading">
            <span className="register-eyebrow">
              TASTELOCAL ACCOUNT SECURITY
            </span>

            <h1>Change Password</h1>

            <p>
              Update your password to keep your TasteLocal account secure.
              Enter your current password and choose a new one.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div
              className="password-reset-success"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {/* Password Change Form */}
          {!message && (
            <form
              onSubmit={handleSubmit}
              className="register-form"
            >

              <div className="register-field">
                <label htmlFor="current-password">
                  Current Password
                </label>

                <input
                  id="current-password"
                  type="password"
                  name="current_password"
                  placeholder="Enter your current password"
                  value={formData.current_password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="new-password">
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  name="new_password"
                  placeholder="Enter your new password"
                  value={formData.new_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={12}
                  required
                />

                <small>Minimum 12 characters.</small>
              </div>

              <div className="register-field">
                <label htmlFor="confirm-new-password">
                  Confirm New Password
                </label>

                <input
                  id="confirm-new-password"
                  type="password"
                  name="confirm_password"
                  placeholder="Enter your new password again"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
              </div>

              <button
                type="submit"
                className="register-submit-btn"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>

            </form>
          )}

          {/* Navigation */}
          <div className="register-login-prompt">
            {message ? (
              <Link to="/login">Continue to Login</Link>
            ) : (
              <Link to="/">Back to Home</Link>
            )}
          </div>

        </div>

        <p className="register-footer-note">
          Good food. Great stories. Local discoveries.
        </p>
      </div>
    </section>
  );
}

export default ChangePassword;
