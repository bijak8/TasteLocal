
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../services/api';

function ResetPassword() {
  const { uidb64, token } = useParams();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
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

    return 'Unable to reset your password. Please try again.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (formData.password.length < 12) {
      setError('Password must contain at least 12 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        `password-reset/confirm/${uidb64}/${token}/`,
        {
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }
      );

      setMessage(
        response.data.message ||
        'Your password has been reset successfully. You can now log in.'
      );

      setFormData({
        password: '',
        confirmPassword: '',
      });

    } catch (error) {
      console.error('Password reset error:', error);

      const responseData = error.response?.data;

      if (responseData) {
        setError(formatApiError(responseData));
      } else {
        setError('Unable to reset your password. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-page">
      <div className="register-container">
        <div className="register-card">

          <div className="register-heading">
            <span className="register-eyebrow">
              TASTELOCAL ACCOUNT RECOVERY
            </span>

            <h1>Reset Your Password</h1>

            <p>
              Create a new password for your TasteLocal account.
              Your password must contain at least 12 characters.
            </p>
          </div>

          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div
              className="password-reset-success"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="register-form">

              <div className="register-field">
                <label htmlFor="reset-password">
                  New Password
                </label>

                <input
                  id="reset-password"
                  type="password"
                  name="password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="reset-confirm-password">
                  Confirm New Password
                </label>

                <input
                  id="reset-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Enter your new password again"
                  value={formData.confirmPassword}
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
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

            </form>
          )}

          <div className="register-login-prompt">
            <Link to="/login">Back to Login</Link>
          </div>

        </div>

        <p className="register-footer-note">
          Your next local food discovery starts here.
        </p>
      </div>
    </section>
  );
}

export default ResetPassword;