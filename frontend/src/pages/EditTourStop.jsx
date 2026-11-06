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

      navigate(
        foodTourId
          ? `/operator/tour-stops?tour_id=${foodTourId}`
          : '/operator/tour-stops'
      );
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
      <div className="container py-5">
        Loading tour stop...
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">

              <h2 className="fw-bold mb-2">
                Edit Tour Stop
              </h2>

              <p className="text-secondary mb-4">
                Update the details and sequence of this food destination.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <h5 className="fw-bold mb-3">
                  Stop Information
                </h5>

                <div className="mb-3">
                  <label className="form-label">Stop Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <hr />

                <h5 className="fw-bold mb-3">
                  Location Details
                </h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Area</label>
                    <input
                      type="text"
                      name="area"
                      className="form-control"
                      value={formData.area}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Latitude (Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      className="form-control"
                      value={formData.latitude}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Longitude (Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      className="form-control"
                      value={formData.longitude}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <hr />

                <h5 className="fw-bold mb-3">
                  Tour Sequence
                </h5>

                <div className="mb-3">
                  <label className="form-label">
                    Stop Order
                  </label>
                  <input
                    type="number"
                    name="stop_order"
                    className="form-control"
                    min="1"
                    step="1"
                    value={formData.stop_order}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">
                    Enter the sequence in which visitors should visit this stop.
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning btn-lg w-100 mt-3"
                  disabled={saving}
                >
                  {saving ? 'Saving Changes...' : 'Update Tour Stop'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() =>
                    navigate(
                      foodTourId
                        ? `/operator/tour-stops?tour_id=${foodTourId}`
                        : '/operator/tour-stops'
                    )
                  }
                >
                  Cancel
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EditTourStop;