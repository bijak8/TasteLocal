import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

function EditTourStop() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
    stop_order: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [foodTourId, setFoodTourId] = useState('');

  useEffect(() => {
    const fetchStop = async () => {
      try {
        const response = await API.get(
          `operator/tour-stops/${id}/`
        );

        const stop = response.data;

        setFoodTourId(stop.food_tour);

        setFormData({
          name: stop.name || '',
          description: stop.description || '',
          address: stop.address || '',
          city: stop.city || '',
          area: stop.area || '',
          latitude: stop.latitude ?? '',
          longitude: stop.longitude ?? '',
          stop_order: stop.stop_order ?? 1,
        });
      } catch (err) {
        console.error('Error fetching tour stop:', err);

        setError(
          err.response?.data?.detail ||
          'Unable to load tour stop.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStop();
  }, [id]);

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const getReturnPath = () => {
    return foodTourId
      ? `/operator/tour-stops?tour_id=${foodTourId}`
      : '/operator/tour-stops';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSaving(true);

    const stopData = {
      ...formData,
      stop_order: Number(formData.stop_order),
      latitude: formData.latitude === ''
        ? null
        : Number(formData.latitude),
      longitude: formData.longitude === ''
        ? null
        : Number(formData.longitude),
    };

    try {
      await API.patch(
        `operator/tour-stops/${id}/`,
        stopData
      );

      alert('Tour stop updated successfully!');
      navigate(getReturnPath());
    } catch (err) {
      console.error('Error updating tour stop:', err);

      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : 'Unable to update tour stop. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-stop-loading">
        <div className="edit-stop-spinner"></div>
        <p>Loading tour stop...</p>
      </div>
    );
  }

  return (
    <div className="edit-stop-page">
      <div className="edit-stop-container">

        <div className="edit-stop-heading">
          <span className="edit-stop-eyebrow">
            TOUR OPERATOR
          </span>

          <h1>Edit Tour Stop</h1>

          <p>
            Update the details and sequence of this food destination.
          </p>
        </div>

        <div className="edit-stop-card">

          <form onSubmit={handleSubmit}>

            {error && (
              <div className="edit-stop-error">
                {error}
              </div>
            )}

            {/* Stop Information */}
            <section className="edit-stop-section">

              <div className="edit-stop-section-heading">
                <span className="edit-stop-section-number">01</span>
                <div>
                  <h2>Stop Information</h2>
                  <p>Describe this food destination.</p>
                </div>
              </div>

              <div className="edit-stop-field">
                <label htmlFor="name">Stop Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter stop name"
                  required
                />
              </div>

              <div className="edit-stop-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this food destination..."
                  required
                />
              </div>

              <div className="edit-stop-field">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  required
                />
              </div>

            </section>

            <div className="edit-stop-divider"></div>

            {/* Location Details */}
            <section className="edit-stop-section">

              <div className="edit-stop-section-heading">
                <span className="edit-stop-section-number">02</span>
                <div>
                  <h2>Location Details</h2>
                  <p>Specify the destination's geographical location.</p>
                </div>
              </div>

              <div className="edit-stop-field-row">

                <div className="edit-stop-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="edit-stop-field">
                  <label htmlFor="area">Area</label>
                  <input
                    id="area"
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Enter area"
                  />
                </div>

              </div>

              <div className="edit-stop-field-row">

                <div className="edit-stop-field">
                  <label htmlFor="latitude">Latitude (Optional)</label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 1.3521"
                  />
                </div>

                <div className="edit-stop-field">
                  <label htmlFor="longitude">Longitude (Optional)</label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 103.8198"
                  />
                </div>

              </div>

              <p className="edit-stop-coordinate-note">
                Coordinates are optional. Leave them blank if they are not available.
              </p>

            </section>

            <div className="edit-stop-divider"></div>

            {/* Tour Sequence */}
            <section className="edit-stop-section">

              <div className="edit-stop-section-heading">
                <span className="edit-stop-section-number">03</span>
                <div>
                  <h2>Tour Sequence</h2>
                  <p>Determine when visitors should visit this stop.</p>
                </div>
              </div>

              <div className="edit-stop-field">
                <label htmlFor="stop_order">Stop Order</label>
                <input
                  id="stop_order"
                  type="number"
                  name="stop_order"
                  min="1"
                  step="1"
                  value={formData.stop_order}
                  onChange={handleChange}
                  required
                />
                <small>
                  Enter the sequence in which visitors should visit this stop.
                </small>
              </div>

            </section>

            {/* Actions */}
            <div className="edit-stop-actions">

              <button
                type="button"
                className="edit-stop-cancel-btn"
                onClick={() => navigate(getReturnPath())}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="edit-stop-save-btn"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Update Tour Stop'}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default EditTourStop;