
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const categoryTabs = [
  {
    key: 'cuisine',
    label: 'Cuisine Categories',
    endpoint: 'admin/categories/cuisine/',
  },
  {
    key: 'experience',
    label: 'Experience Categories',
    endpoint: 'admin/categories/experience/',
  },
  {
    key: 'food-tour',
    label: 'Food Tour Categories',
    endpoint: 'admin/categories/food-tour/',
  },
];

function AdminCategoryManagement() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('cuisine');
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedTab = categoryTabs.find(
    (tab) => tab.key === activeTab
  );

  const loadCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await API.get(selectedTab.endpoint);
      setCategories(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load categories. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError('Please enter a category name.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await API.post(selectedTab.endpoint, {
        name: categoryName.trim(),
        is_active: true,
      });

      setCategoryName('');
      setSuccess('Category added successfully.');
      await loadCategories();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.name?.[0] ||
        data?.detail ||
        'Unable to add category. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async (id) => {
    if (!editingName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await API.patch(`${selectedTab.endpoint}${id}/`, {
        name: editingName.trim(),
      });

      setEditingId(null);
      setEditingName('');
      setSuccess('Category updated successfully.');
      await loadCategories();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.name?.[0] ||
        data?.detail ||
        'Unable to update category. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (category) => {
    const action = category.is_active ? 'deactivate' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${action} this category?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await API.patch(`${selectedTab.endpoint}${category.id}/`, {
        is_active: !category.is_active,
      });

      setSuccess(
        category.is_active
          ? 'Category deactivated successfully.'
          : 'Category reactivated successfully.'
      );

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to update category status. Please try again.'
      );
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError('');
    setSuccess('');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1>Category Management</h1>
          <p>Manage cuisine, food experience and food tour categories.</p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate('/admin/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="admin-category-tabs">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-category-tab ${
              activeTab === tab.key ? 'active' : ''
            }`}
            onClick={() => {
              setActiveTab(tab.key);
              setEditingId(null);
              setEditingName('');
              setError('');
              setSuccess('');
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-category-content">
        <h2>{selectedTab.label}</h2>

        <form
          className="admin-category-add-form"
          onSubmit={handleAddCategory}
        >
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter new category name"
            maxLength={100}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add Category'}
          </button>
        </form>

        {error && (
          <div className="admin-category-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-category-message success">
            {success}
          </div>
        )}

        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="admin-category-list">
            {categories.length === 0 ? (
              <p>No categories found.</p>
            ) : (
              categories.map((category) => (
                <div
                  className="admin-category-row"
                  key={category.id}
                >
                  {editingId === category.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) =>
                          setEditingName(e.target.value)
                        }
                        maxLength={100}
                      />

                      <div className="admin-category-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditCategory(category.id)
                          }
                          disabled={saving}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          className="secondary"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="admin-category-details">
                        <span className="admin-category-name">
                          {category.name}
                        </span>

                        <span
                          className={`admin-category-status ${
                            category.is_active ? 'active' : 'inactive'
                          }`}
                        >
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="admin-category-actions">
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={
                            category.is_active
                              ? 'danger'
                              : 'secondary'
                          }
                          onClick={() =>
                            handleToggleStatus(category)
                          }
                        >
                          {category.is_active
                            ? 'Deactivate'
                            : 'Reactivate'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategoryManagement;
