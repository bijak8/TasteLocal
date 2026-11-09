
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../AdminDashboard.css';

function AdminVendorManagement() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch vendors from Django API
  useEffect(() => {
    let cancelled = false;

    const fetchVendors = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await API.get('admin/vendors/', {
          params,
        });

        if (!cancelled) {
          setVendors(response.data);
        }

      } catch (err) {
        console.error('Error fetching vendors:', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unable to load vendors. Please try again.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVendors();

    return () => {
      cancelled = true;
    };

  }, [navigate, search, statusFilter]);

  // Update vendor approval status
  const handleStatusUpdate = async (vendorId, newStatus) => {
    const vendor = vendors.find(
      (item) => item.id === vendorId
    );

    if (!vendor) return;

    const action = newStatus === 'approved'
      ? 'approve'
      : 'reject';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${vendor.business_name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(vendorId);
      setError('');

      const response = await API.patch(
        `admin/vendors/${vendorId}/status/`,
        { status: newStatus }
      );

      const updatedVendor = response.data.profile;

      setVendors((previous) =>
        previous.map((item) =>
          item.id === vendorId ? updatedVendor : item
        )
      );

    } catch (err) {
      console.error('Error updating vendor status:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to update vendor status.'
      );

    } finally {
      setUpdatingId(null);
    }
  };

  // Format registration date
  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        {/* Page Header */}
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-eyebrow">
              TASTELOCAL ADMINISTRATION
            </span>

            <h1>Vendor Management</h1>

            <p>
              Manage vendor registrations and business
              approval applications.
            </p>
          </div>

          <div className="admin-dashboard-welcome">
            <span>ADMIN PORTAL</span>
            <strong>Vendor Management</strong>
          </div>
        </header>

        {/* Search and Filter */}
        <section className="admin-vendor-toolbar">

          <div className="admin-vendor-search">
            <input
              type="text"
              placeholder="Search business, owner or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-vendor-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

        </section>

        {/* Error Message */}
        {error && (
          <div className="admin-vendor-error">
            {error}
          </div>
        )}

        {/* Vendor Table */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              PROVIDER MANAGEMENT
            </span>

            <h2>Registered Vendors</h2>

            <p>
              Review vendor information and manage account
              approval statuses.
            </p>
          </div>

          {loading ? (
            <div className="admin-dashboard-loading">
              <div className="admin-dashboard-spinner"></div>
              <p>Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="admin-vendor-empty">
              <h3>No Vendors Found</h3>
              <p>
                There are currently no vendors matching
                your search or filter.
              </p>
            </div>
          ) : (
            <div className="admin-vendor-table-wrapper">

              <table className="admin-vendor-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>

                      <td>
                        <strong>
                          {vendor.business_name}
                        </strong>
                      </td>

                      <td>{vendor.owner_name}</td>

                      <td>
                        <span>{vendor.email}</span>
                        <small>{vendor.phone}</small>
                      </td>

                      <td>
                        {[
                          vendor.area,
                          vendor.city,
                        ].filter(Boolean).join(', ') || '-'}
                      </td>

                      <td>
                        {formatDate(vendor.created_at)}
                      </td>

                      <td>
                        <span
                          className={`admin-vendor-status ${vendor.status}`}
                        >
                          {vendor.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-vendor-actions">

                          {vendor.status !== 'approved' && (
                            <button
                              type="button"
                              className="admin-vendor-approve"
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  vendor.id,
                                  'approved'
                                )
                              }
                            >
                              {updatingId === vendor.id
                                ? 'Updating...'
                                : 'Approve'}
                            </button>
                          )}

                          {vendor.status !== 'rejected' && (
                            <button
                              type="button"
                              className="admin-vendor-reject"
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  vendor.id,
                                  'rejected'
                                )
                              }
                            >
                              Reject
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-vendor-count">
                Showing {vendors.length} vendor(s)
              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default AdminVendorManagement;
