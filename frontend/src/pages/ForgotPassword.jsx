
import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await API.post('password-reset/', {
        email: email.trim(),
      });

      setMessage(
        response.data.message ||
        'If an account exists with that email address, a password reset link has been sent.'
      );

    } catch (error) {
      console.error('Password reset request error:', error);

      const responseData = error.response?.data;

      if (responseData?.email) {
        setError(responseData.email.join(' '));
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else {
        setError('Unable to process your request. Please try again.');
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

            <h1>Forgot Password?</h1>

            <p>
              No worries! Enter the email address associated with
              your TasteLocal account and we will send you a link
              to reset your password.
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

          <form onSubmit={handleSubmit} className="register-form">

            <div className="register-field">
              <label htmlFor="forgot-password-email">
                Email Address
              </label>

              <input
                id="forgot-password-email"
                type="email"
                name="email"
                placeholder="Enter your registered email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

          </form>

          <div className="register-login-prompt">
            Remember your password?{' '}
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

export default ForgotPassword;
