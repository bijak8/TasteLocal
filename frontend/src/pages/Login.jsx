
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await API.post('token/', formData);

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('username', formData.username);

      alert('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK TO TASTELOCAL</span>

            <h1>Welcome Back</h1>

            <p>
              Sign in to continue discovering local food,
              memorable experiences and hidden gems.
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="login-register-prompt">
            Don't have an account?{' '}
            <Link to="/register">Create an account</Link>
          </div>
        </div>

        <p className="login-footer-note">
          Good food. Great stories. Local discoveries.
        </p>
      </div>
    </section>
  );
}

export default Login;
