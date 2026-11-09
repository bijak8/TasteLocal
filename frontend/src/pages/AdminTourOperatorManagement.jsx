
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../AdminDashboard.css';

function AdminTourOperatorManagement() {
  const navigate = useNavigate();

  const [tourOperators, setTourOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch tour operators from Django API
  useEffect(() => {
    let cancelled = false;

    const fetchTourOperators = async () => {
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

        const response = await API.get('admin/tour-operators/', {
          params,
        });

        if (!cancelled) {
          setTourOperators(response.data);
        }

      } catch (err) {
        console.error('Error fetching tour operators:', err);

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
            'Unable to load tour operators. Please try again.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTourOperators();

    return () => {
      cancelled = true;
    };

  }, [navigate, search, statusFilter]);

  // Update tour operator approval status
  const handleStatusUpdate = async (operatorId, newStatus) => {
    const operator = tourOperators.find(
      (item) => item.id === operatorId
    );

    if (!operator) return;

    const action = newStatus === 'approved'
      ? 'approve'
      : 'reject';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${operator.business_name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(operatorId);
      setError('');

      const response = await API.patch(
        `admin/tour-operators/${operatorId}/status/`,
        { status: newStatus }
      );

      const updatedOperator = response.data.profile;

      setTourOperators((previous) =>
        previous.map((item) =>
          item.id === operatorId ? updatedOperator : item
        )
      );

    } catch (err) {
      console.error('Error updating tour operator status:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to update tour operator status.'
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

            <h1>Tour Operator Management</h1>

            <p>
              Manage tour operator registrations and
              business approval applications.
            </p>
          </div>

          <div className="admin-dashboard-welcome">
            <span>ADMIN PORTAL</span>
            <strong>Tour Operator Management</strong>
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

        {/* Tour Operator Table */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              PROVIDER MANAGEMENT
            </span>

            <h2>Registered Tour Operators</h2>

            <p>
              Review tour operator information and manage
              account approval statuses.
            </p>
          </div>

          {loading ? (
            <div className="admin-dashboard-loading">
              <div className="admin-dashboard-spinner"></div>
              <p>Loading tour operators...</p>
            </div>
          ) : tourOperators.length === 0 ? (
            <div className="admin-vendor-empty">
              <h3>No Tour Operators Found</h3>
              <p>
                There are currently no tour operators matching
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
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tourOperators.map((operator) => (
                    <tr key={operator.id}>

                      <td>
                        <strong>
                          {operator.business_name}
                        </strong>
                      </td>

                      <td>{operator.owner_name}</td>

                      <td>
                        <span>{operator.email}</span>
                        <small>{operator.phone}</small>
                      </td>

                      <td>
                        {formatDate(operator.created_at)}
                      </td>

                      <td>
                        <span
                          className={`admin-vendor-status ${operator.status}`}
                        >
                          {operator.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-vendor-actions">

                          {operator.status !== 'approved' && (
                            <button
                              type="button"
                              className="admin-vendor-approve"
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  operator.id,
                                  'approved'
                                )
                              }
                            >
                              {updatingId === operator.id
                                ? 'Updating...'
                                : 'Approve'}
                            </button>
                          )}

                          {operator.status !== 'rejected' && (
                            <button
                              type="button"
                              className="admin-vendor-reject"
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  operator.id,
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
                Showing {tourOperators.length} tour operator(s)
              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default AdminTourOperatorManagement;
