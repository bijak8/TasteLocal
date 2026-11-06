
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await API.post('register/tourist/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);

      const responseData = error.response?.data;

      if (responseData) {
        setError(JSON.stringify(responseData));
      } else {
        setError('Unable to register. Please try again.');
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
            <span className="register-eyebrow">WELCOME TO TASTELOCAL</span>

            <h1>Create Your Account</h1>

            <p>
              Discover authentic local food, explore new flavours
              and experience the culture behind every dish.
            </p>
          </div>

          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="Enter your password again"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-login-prompt">
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </div>
        </div>

        <p className="register-footer-note">
          Your next local food discovery starts here.
        </p>
      </div>
    </section>
  );
}

export default Register;
