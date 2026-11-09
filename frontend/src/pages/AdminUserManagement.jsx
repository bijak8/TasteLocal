
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../AdminDashboard.css';

function AdminUserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Fetch users from Django API
  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const params = {
          limit,
          offset,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (roleFilter) {
          params.role = roleFilter;
        }

        if (statusFilter) {
          params.is_active = statusFilter;
        }

        const response = await API.get('admin/users/', {
          params,
        });

        if (!cancelled) {
          setUsers(response.data.results);
          setTotalCount(response.data.count);
        }

      } catch (err) {
        console.error('Error fetching users:', err);

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
            'Unable to load users. Please try again.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };

  }, [navigate, search, roleFilter, statusFilter, limit, offset]);

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0);
  }, [search, roleFilter, statusFilter]);

  // Update user account status
  const handleStatusUpdate = async (userId, newStatus) => {
    const user = users.find(
      (item) => item.id === userId
    );

    if (!user) return;

    const action = newStatus ? 'activate' : 'deactivate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.username}'s account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(userId);
      setError('');

      const response = await API.patch(
        `admin/users/${userId}/status/`,
        { is_active: newStatus }
      );

      const updatedUser = response.data.user;

      setUsers((previous) =>
        previous.map((item) =>
          item.id === userId ? updatedUser : item
        )
      );

    } catch (err) {
      console.error('Error updating user status:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to update user account.'
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

  // Format last login
  const formatLastLogin = (date) => {
    if (!date) return 'Never';

    return new Date(date).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        {/* Page Header */}
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-eyebrow">
              TASTELOCAL ADMINISTRATION
            </span>

            <h1>User Management</h1>

            <p>
              Manage registered users and monitor account
              activities.
            </p>
          </div>

          <div className="admin-dashboard-welcome">
            <span>ADMIN PORTAL</span>
            <strong>User Management</strong>
          </div>
        </header>

        {/* Search and Filters */}
        <section className="admin-vendor-toolbar">

          <div className="admin-vendor-search">
            <input
              type="text"
              placeholder="Search username, name, email or business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-vendor-filter">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Tourist">Tourist</option>
              <option value="Vendor">Vendor</option>
              <option value="Tour Operator">Tour Operator</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="admin-vendor-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Account Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

        </section>

        {/* Error Message */}
        {error && (
          <div className="admin-vendor-error">
            {error}
          </div>
        )}

        {/* Users Table */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              ACCOUNT MANAGEMENT
            </span>

            <h2>Registered Users</h2>

            <p>
              Review user information and manage account
              access.
            </p>
          </div>

          {loading ? (
            <div className="admin-dashboard-loading">
              <div className="admin-dashboard-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-vendor-empty">
              <h3>No Users Found</h3>
              <p>
                There are currently no users matching
                your search or filters.
              </p>
            </div>
          ) : (
            <div className="admin-vendor-table-wrapper">

              <table className="admin-vendor-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Business</th>
                    <th>Registered</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>

                      <td>
                        <strong>
                          {[user.first_name, user.last_name]
                            .filter(Boolean)
                            .join(' ') || user.username}
                        </strong>
                        <small>@{user.username}</small>
                      </td>

                      <td>{user.email || '-'}</td>

                      <td>{user.role}</td>

                      <td>
                        {user.business_name || '-'}
                        {user.profile_status && (
                          <small>
                            Profile: {user.profile_status}
                          </small>
                        )}
                      </td>

                      <td>{formatDate(user.date_joined)}</td>

                      <td>{formatLastLogin(user.last_login)}</td>

                      <td>
                        <span
                          className={`admin-vendor-status ${
                            user.is_active ? 'approved' : 'rejected'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td>
                        <div className="admin-vendor-actions">

                          {user.role !== 'Admin' && (
                            <button
                              type="button"
                              className={
                                user.is_active
                                  ? 'admin-vendor-reject'
                                  : 'admin-vendor-approve'
                              }
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  user.id,
                                  !user.is_active
                                )
                              }
                            >
                              {updatingId === user.id
                                ? 'Updating...'
                                : user.is_active
                                  ? 'Deactivate'
                                  : 'Activate'}
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-vendor-count">
                Showing {offset + 1}–
                {Math.min(offset + users.length, totalCount)}
                {' '}of {totalCount} user(s)
              </div>

              {/* Pagination */}
              <div className="admin-user-pagination">

                <button
                  type="button"
                  disabled={offset === 0 || loading}
                  onClick={() =>
                    setOffset((previous) =>
                      Math.max(0, previous - limit)
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  disabled={
                    offset + limit >= totalCount || loading
                  }
                  onClick={() =>
                    setOffset((previous) =>
                      previous + limit
                    )
                  }
                >
                  Next
                </button>

              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default AdminUserManagement;