
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function BusinessProfileForm({ accountType }) {
  const navigate = useNavigate();

  const isVendor = accountType === 'Vendor';

  const endpoint = isVendor
    ? 'vendor/profile/'
    : 'operator/profile/';

  const dashboardPath = isVendor
    ? '/vendor/dashboard'
    : '/operator/dashboard';

  const pageTitle = isVendor
    ? 'Vendor Business Profile'
    : 'Tour Operator Business Profile';

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    social_media: '',
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fields = [
    { name: 'business_name', label: 'Business Name', required: true },
    { name: 'owner_name', label: 'Owner Name', required: true },
    { name: 'email', label: 'Business Email', type: 'email', required: true },
    { name: 'phone', label: 'Contact Number', type: 'tel', required: true },
    { name: 'description', label: 'Business Description', multiline: true },
    { name: 'website', label: 'Website', type: 'url' },
    { name: 'social_media', label: 'Social Media' },

    ...(isVendor
      ? [
          { name: 'address', label: 'Business Address', multiline: true },
          { name: 'city', label: 'City' },
          { name: 'area', label: 'Area' },
          { name: 'latitude', label: 'Latitude', type: 'number' },
          { name: 'longitude', label: 'Longitude', type: 'number' },
        ]
      : []),
  ];

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

      const response = await API.get(endpoint);
      const data = response.data;

      setProfile(data);

      setFormData({
        business_name: data.business_name || '',
        owner_name: data.owner_name || '',
        email: data.email || '',
        phone: data.phone || '',
        description: data.description || '',
        website: data.website || '',
        social_media: data.social_media || '',
        address: data.address || '',
        city: data.city || '',
        area: data.area || '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
      });

      setLogoPreview(data.logo || '');
    } catch (err) {
      console.error('Error fetching business profile:', err);

      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.detail ||
        'Unable to load your business profile.'
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

  const handleLogoChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const data = new FormData();

      fields.forEach((field) => {
        data.append(field.name, formData[field.name] ?? '');
      });

      if (logoFile) {
        data.append('logo', logoFile);
      }

      const response = await API.patch(endpoint, data);

      setProfile(response.data);

      setFormData({
        business_name: response.data.business_name || '',
        owner_name: response.data.owner_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        description: response.data.description || '',
        website: response.data.website || '',
        social_media: response.data.social_media || '',
        address: response.data.address || '',
        city: response.data.city || '',
        area: response.data.area || '',
        latitude: response.data.latitude ?? '',
        longitude: response.data.longitude ?? '',
      });

      setLogoPreview(response.data.logo || logoPreview);
      setLogoFile(null);

      setSuccess(
        'Your business profile has been updated successfully!'
      );
    } catch (err) {
      console.error('Error updating business profile:', err);

      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      const errorData = err.response?.data;

      setError(
        typeof errorData === 'object' && errorData !== null
          ? Object.entries(errorData)
              .map(([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages)
                    ? messages.join(', ')
                    : String(messages)
                }`
              )
              .join(' | ')
          : 'Unable to update your business profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const status = profile?.status?.toLowerCase() || 'pending';

  const statusDescription = {
    approved: `Your ${isVendor ? 'vendor' : 'tour operator'} account is approved. You can manage your business activities on TasteLocal.`,
    pending: 'Your business account is awaiting approval. You will be able to manage your business activities once approved.',
    rejected: 'Your business account application has been rejected. Please contact the administrator for more information.',
  };

  if (loading) {
    return (
      <section className="tourist-profile-page">
        <div className="profile-loading">
          <div className="profile-loader"></div>
          <p>Loading your business profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="tourist-profile-page">
        <div className="tourist-profile-container">
          <div className="profile-alert profile-alert-error">
            {error || 'Business profile not found.'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tourist-profile-page">
      <div className="tourist-profile-container">

        {/* Page Heading */}

        <div className="profile-page-heading">
          <div>
            <span className="profile-eyebrow">
              YOUR TASTELOCAL BUSINESS ACCOUNT
            </span>

            <h1>{pageTitle}</h1>

            <p>
              Keep your business information up to date
              for your TasteLocal account.
            </p>
          </div>

          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate(dashboardPath)}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Business Account Status */}

        <div className={`business-profile-status-card status-${status}`}>
          <div className="business-profile-status-content">
            <span className="profile-eyebrow">
              ACCOUNT STATUS
            </span>

            <h2>Business Approval Status</h2>

            <p>
              {statusDescription[status] ||
                'Your account status is currently unavailable. Please contact the administrator.'}
            </p>
          </div>

          <span
            className={`business-profile-status-badge status-${status}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Business Profile Card */}

        <div className="profile-content-card">

          {/* Card Heading */}

          <div className="profile-card-heading">

            <div className="profile-avatar">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Business Logo"
                  className="profile-avatar-image"
                />
              ) : (
                formData.business_name
                  ? formData.business_name.charAt(0).toUpperCase()
                  : 'B'
              )}
            </div>

            <div>
              <h2>Business Information</h2>
              <p>Manage your business details below.</p>
            </div>

          </div>

          {/* Error Message */}

          {error && (
            <div
              className="profile-alert profile-alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Success Message */}

          {success && (
            <div
              className="profile-alert profile-alert-success"
              role="status"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Business Logo */}

            <div className="profile-form-group">
              <label htmlFor="business_logo">
                Business Logo
              </label>

              <input
                id="business_logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />

              <small>
                Choose a JPG, PNG or other image file for your business logo.
              </small>
            </div>

            {/* Business Fields */}

            {fields.map((field) => (
              field.multiline ? (
                <div
                  className="profile-form-group"
                  key={field.name}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && ' *'}
                  </label>

                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    rows="4"
                    required={field.required || false}
                    placeholder={
                      field.name === 'description'
                        ? 'Tell customers about your business...'
                        : ''
                    }
                  />
                </div>
              ) : (
                <div
                  className="profile-form-group"
                  key={field.name}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && ' *'}
                  </label>

                  <input
                    id={field.name}
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required || false}
                    step={
                      field.name === 'latitude' ||
                      field.name === 'longitude'
                        ? 'any'
                        : undefined
                    }
                    placeholder={
                      field.name === 'website'
                        ? 'https://example.com'
                        : ''
                    }
                  />
                </div>
              )
            ))}

            {/* Form Actions */}

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

export default BusinessProfileForm;
