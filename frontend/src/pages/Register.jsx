
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

// Icons for the account type selection tabs
function AccountTypeIcon({ type }) {
  const commonProps = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (type === 'tourist') {
    return (
      <svg {...commonProps}>
        <rect x="5" y="6" width="14" height="16" rx="3" />
        <path d="M9 6V4a3 3 0 0 1 6 0v2" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    );
  }

  if (type === 'vendor') {
    return (
      <svg {...commonProps}>
        <path d="M3 10h18l-2-6H5l-2 6Z" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
        <path d="M3 10a2.5 2.5 0 0 0 5 0" />
        <path d="M8 10a2.5 2.5 0 0 0 5 0" />
        <path d="M13 10a2.5 2.5 0 0 0 5 0" />
        <path d="M18 10a2.5 2.5 0 0 0 3 0" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M5 3 3 5M19 3l2 2" />
    </svg>
  );
}

function Register() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('tourist');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    owner_name: '',
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
    description: '',
    website: '',
    social_media: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Switch account type
  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setError('');
  };

  // Format errors returned by Django
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

    return 'Unable to register. Please try again.';
  };

  // Submit registration form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Minimum password length
    if (formData.password.length < 12) {
      setError('Password must contain at least 12 characters.');
      return;
    }

    // Registration endpoints
    const endpointMap = {
      tourist: 'register/tourist/',
      vendor: 'register/vendor/',
      tour_operator: 'register/tour-operator/',
    };

    // Common registration fields
    let registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    // Tourist registration fields
    if (accountType === 'tourist') {
      registrationData = {
        ...registrationData,
        phone: formData.phone,
      };
    }

    // Vendor registration fields
    if (accountType === 'vendor') {
      registrationData = {
        ...registrationData,
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        area: formData.area,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        description: formData.description,
        website: formData.website,
        social_media: formData.social_media,
      };
    }

    // Tour Operator registration fields
    if (accountType === 'tour_operator') {
      registrationData = {
        ...registrationData,
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        description: formData.description,
        website: formData.website,
        social_media: formData.social_media,
      };
    }

    setLoading(true);

    try {
      await API.post(endpointMap[accountType], registrationData);

      alert('Registration successful! Please log in.');
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);

      const responseData = error.response?.data;

      if (responseData) {
        setError(formatApiError(responseData));
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

          {/* Page Heading */}
          <div className="register-heading">
            <span className="register-eyebrow">
              WELCOME TO TASTELOCAL
            </span>

            <h1>Create Your Account</h1>

            <p>
              Discover authentic local food, explore new flavours
              and experience the culture behind every dish.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">

            {/* Account Type Selection */}
            <div className="register-account-selector">
              <p className="register-account-label">
                I am a...
              </p>

              <div
                className="register-account-tabs"
                role="group"
                aria-label="Select account type"
              >
                <button
                  type="button"
                  className={`register-account-tab ${
                    accountType === 'tourist' ? 'active' : ''
                  }`}
                  aria-pressed={accountType === 'tourist'}
                  onClick={() => handleAccountTypeChange('tourist')}
                >
                  <AccountTypeIcon type="tourist" />
                  <span>Tourist</span>
                </button>

                <button
                  type="button"
                  className={`register-account-tab ${
                    accountType === 'vendor' ? 'active' : ''
                  }`}
                  aria-pressed={accountType === 'vendor'}
                  onClick={() => handleAccountTypeChange('vendor')}
                >
                  <AccountTypeIcon type="vendor" />
                  <span>Vendor</span>
                </button>

                <button
                  type="button"
                  className={`register-account-tab ${
                    accountType === 'tour_operator' ? 'active' : ''
                  }`}
                  aria-pressed={accountType === 'tour_operator'}
                  onClick={() => handleAccountTypeChange('tour_operator')}
                >
                  <AccountTypeIcon type="tour_operator" />
                  <span>Tour Operator</span>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="register-field">
              <label htmlFor="register-username">
                Username
              </label>

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
              <label htmlFor="register-email">
                Email Address
              </label>

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

            {/* Tourist Fields */}
            {accountType === 'tourist' && (
              <div className="register-field">
                <label htmlFor="tourist-phone">
                  Phone Number
                </label>

                <input
                  id="tourist-phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            )}

            {/* Vendor and Tour Operator Fields */}
            {(accountType === 'vendor' ||
              accountType === 'tour_operator') && (
              <>
                <div className="register-field">
                  <label htmlFor="business-name">
                    Business Name
                  </label>

                  <input
                    id="business-name"
                    type="text"
                    name="business_name"
                    placeholder="Enter your business name"
                    value={formData.business_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="owner-name">
                    Owner Name
                  </label>

                  <input
                    id="owner-name"
                    type="text"
                    name="owner_name"
                    placeholder="Enter the owner's name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="business-phone">
                    Phone Number
                  </label>

                  <input
                    id="business-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your business phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* Vendor-only Fields */}
                {accountType === 'vendor' && (
                  <>
                    <div className="register-field">
                      <label htmlFor="business-address">
                        Business Address
                      </label>

                      <input
                        id="business-address"
                        type="text"
                        name="address"
                        placeholder="Enter your business address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="register-field">
                      <label htmlFor="business-city">
                        City
                      </label>

                      <input
                        id="business-city"
                        type="text"
                        name="city"
                        placeholder="Enter your city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="register-field">
                      <label htmlFor="business-area">
                        Area
                      </label>

                      <input
                        id="business-area"
                        type="text"
                        name="area"
                        placeholder="Enter your area"
                        value={formData.area}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="register-field">
                      <label htmlFor="business-latitude">
                        Latitude (Optional)
                      </label>

                      <input
                        id="business-latitude"
                        type="number"
                        step="any"
                        name="latitude"
                        placeholder="Enter latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="register-field">
                      <label htmlFor="business-longitude">
                        Longitude (Optional)
                      </label>

                      <input
                        id="business-longitude"
                        type="number"
                        step="any"
                        name="longitude"
                        placeholder="Enter longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* Optional Business Fields */}
                <div className="register-field">
                  <label htmlFor="business-description">
                    Business Description (Optional)
                  </label>

                  <textarea
                    id="business-description"
                    name="description"
                    placeholder="Tell us about your business"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="business-website">
                    Website (Optional)
                  </label>

                  <input
                    id="business-website"
                    type="url"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="business-social-media">
                    Social Media URL (Optional)
                  </label>

                  <input
                    id="business-social-media"
                    type="url"
                    name="social_media"
                    placeholder="https://www.instagram.com/yourbusiness"
                    value={formData.social_media}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="register-field">
              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={12}
                required
              />

              <small>
                Minimum 12 characters.
              </small>
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

            {/* Submit Button */}
            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>

          {/* Login Link */}
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
