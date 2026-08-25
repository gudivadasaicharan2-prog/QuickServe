import React, { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if adding, category object if editing
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const data = await fetchApi('/api/categories');
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setActionError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setActionError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    };

    try {
      if (editingCategory) {
        // Update existing category (PUT /api/categories/{id})
        const updated = await fetchApi(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: payload,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        // Create new category (POST /api/categories)
        const created = await fetchApi('/api/categories', {
          method: 'POST',
          body: payload,
        });
        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      handleCloseModal();
    } catch (err) {
      setActionError(`Failed to ${editingCategory ? 'update' : 'create'} category: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }
    setActionError(null);
    try {
      await fetchApi(`/api/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setActionError(`Failed to delete category "${name}": ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Categories</h1>
        <p style={styles.loadingText}>Loading categories…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <h1>Categories</h1>
        <p style={styles.errorText}>{error}</p>
        <button onClick={loadCategories} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1>Categories</h1>
        <button onClick={handleOpenAddModal} style={styles.addBtn}>
          + Add Category
        </button>
      </div>

      {actionError && <p style={styles.errorText}>{actionError}</p>}

      {categories.length === 0 ? (
        <p style={styles.emptyText}>No categories found. Click "+ Add Category" to create one.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Created At</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>#{cat.id}</strong>
                </td>
                <td style={styles.td}>
                  <strong>{cat.name}</strong>
                </td>
                <td style={styles.td}>{cat.description || '—'}</td>
                <td style={styles.td}>{fmtDate(cat.createdAt)}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div style={styles.overlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={handleCloseModal} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  style={styles.input}
                  placeholder="e.g. Starters, Desserts, Beverages"
                />
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

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitBtn}
                >
                  {submitting ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
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
    marginBottom: '1.25rem',
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
  editBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '0.5rem',
  },
  deleteBtn: {
    padding: '0.35rem 0.75rem',
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
    maxWidth: '500px',
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

export default Categories;
