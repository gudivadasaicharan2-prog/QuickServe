import React, { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';

const fmt = (amount) => (amount != null ? `₹${Number(amount).toFixed(2)}` : '—');

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Modal State for adding new item
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    preparationTime: '',
    imageUrl: '',
    available: true,
  });

  const loadData = useCallback(async (catId) => {
    const isInitial = catId === undefined;
    if (isInitial) {
      setLoading(true);
    } else {
      setFilterLoading(true);
    }
    setError(null);
    setActionError(null);

    try {
      const catPromise = categories.length === 0 ? fetchApi('/api/categories') : Promise.resolve(categories);
      const menuEndpoint =
        !catId || catId === 'ALL'
          ? '/api/menu'
          : `/api/menu/category/${catId}`;
      const menuPromise = fetchApi(menuEndpoint);

      const [cats, items] = await Promise.all([catPromise, menuPromise]);
      if (categories.length === 0) {
        setCategories(cats);
      }
      setMenuItems(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    loadData('ALL');
  }, [loadData]);

  const handleCategoryFilter = (catId) => {
    setSelectedCategory(catId);
    loadData(catId);
  };

  const handleToggleAvailability = async (id) => {
    setActionError(null);
    try {
      const updated = await fetchApi(`/api/menu/${id}/availability`, {
        method: 'PATCH',
      });
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      setActionError(`Failed to update item availability: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setActionError(null);
    try {
      await fetchApi(`/api/menu/${id}`, { method: 'DELETE' });
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setActionError(`Failed to delete item: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId, 10),
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime, 10) : undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        available: formData.available,
      };

      const newItem = await fetchApi('/api/menu', {
        method: 'POST',
        body: payload,
      });

      setMenuItems((prev) => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        preparationTime: '',
        imageUrl: '',
        available: true,
      });
    } catch (err) {
      setActionError(`Failed to create item: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Menu Management</h1>
        <p style={styles.loadingText}>Loading menu items…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <h1>Menu Management</h1>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => loadData('ALL')} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1>Menu Management</h1>
        <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
          + Add Menu Item
        </button>
      </div>

      {actionError && <p style={styles.errorText}>{actionError}</p>}

      {/* Category filter tabs */}
      <div style={styles.filterRow}>
        <button
          onClick={() => handleCategoryFilter('ALL')}
          disabled={filterLoading}
          style={{
            ...styles.filterBtn,
            ...(selectedCategory === 'ALL' ? styles.filterBtnActive : {}),
          }}
        >
          All Items ({menuItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            disabled={filterLoading}
            style={{
              ...styles.filterBtn,
              ...(selectedCategory === cat.id ? styles.filterBtnActive : {}),
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filterLoading && <p style={styles.loadingText}>Filtering…</p>}

      {/* Menu items table */}
      {!filterLoading && menuItems.length === 0 ? (
        <p style={styles.emptyText}>No menu items found for the selected category.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Prep Time</th>
              <th style={styles.th}>Description</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{item.name}</strong>
                </td>
                <td style={styles.td}>{item.categoryName || '—'}</td>
                <td style={styles.td}><strong>{fmt(item.price)}</strong></td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  {item.preparationTime ? `${item.preparationTime} mins` : '—'}
                </td>
                <td style={styles.td}>
                  <span style={styles.descriptionText}>{item.description || '—'}</span>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: item.available ? '#10b981' : '#ef4444',
                    }}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    style={{
                      ...styles.toggleBtn,
                      backgroundColor: item.available ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {item.available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Menu Item</h2>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleAddItemSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  style={styles.input}
                  placeholder="e.g. Garlic Naan"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0.01"
                    style={styles.input}
                    placeholder="e.g. 150.00"
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Prep Time (mins)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    min="1"
                    style={styles.input}
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                  style={{ ...styles.input, resize: 'vertical' }}
                  placeholder="Optional description"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  maxLength={500}
                  style={styles.input}
                  placeholder="https://example.com/item.jpg"
                />
              </div>

              <div style={{ ...styles.inputGroup, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                />
                <label htmlFor="available" style={{ ...styles.label, marginBottom: 0, cursor: 'pointer' }}>
                  Available Immediately
                </label>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitBtn}
                >
                  {submitting ? 'Saving…' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '1.5rem',
    fontFamily: 'sans-serif',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  filterBtn: {
    padding: '0.4rem 0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  filterBtnActive: {
    background: '#1e293b',
    color: 'white',
    borderColor: '#1e293b',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.65rem 0.75rem',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
    color: '#374151',
    background: '#f9fafb',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '0.65rem 0.75rem',
    verticalAlign: 'middle',
    color: '#111827',
  },
  descriptionText: {
    color: '#4b5563',
    fontSize: '0.85rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
  },
  toggleBtn: {
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '0.5rem',
  },
  deleteBtn: {
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  loadingText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#dc2626',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#9ca3af',
    marginTop: '1rem',
    fontStyle: 'italic',
  },
  retryBtn: {
    marginTop: '0.75rem',
    padding: '0.4rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.75rem',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#6b7280',
    lineHeight: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.25rem',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  submitBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
};

export default Menu;
