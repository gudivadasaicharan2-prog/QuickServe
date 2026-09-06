import { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { Plus, Tag, Edit2, Trash2, AlertCircle } from 'lucide-react';

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
        const updated = await fetchApi(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: payload,
        });
        setCategories((prev) =>
          prev
            .map((c) => (c.id === editingCategory.id ? updated : c))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
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
      setActionError(
        `Failed to ${editingCategory ? 'update' : 'create'} category: ${err.message}`
      );
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

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage food & beverage groups for customer menu filtering"
        action={
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            Add Category
          </button>
        }
      />

      {actionError && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      {loading && (
        <div className="state-container">
          <div className="spinner" />
          <span className="state-title">Loading categories…</span>
        </div>
      )}

      {error && !loading && (
        <div>
          <div className="error-banner">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadCategories}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="state-container card">
          <Tag size={32} strokeWidth={1.25} style={{ opacity: 0.3 }} />
          <span className="state-title">No categories found</span>
          <span className="state-desc">Click "+ Add Category" to create one.</span>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="card hide-mobile" style={{ overflow: 'auto' }}>
            <table className="qs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                        #{cat.id}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.9375rem' }}>{cat.name}</strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 360 }}>
                      {cat.description || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {fmtDate(cat.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="btn btn-sm btn-secondary"
                          aria-label="Edit category"
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="btn btn-sm btn-danger"
                          aria-label="Delete category"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="show-mobile" style={{ flexDirection: 'column', gap: '0.75rem' }}>
            {categories.map((cat) => (
              <div key={cat.id} className="card card-body" style={{ padding: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.375rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1rem' }}>{cat.name}</strong>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        marginLeft: '0.5rem',
                      }}
                    >
                      #{cat.id}
                    </span>
                  </div>
                </div>

                {cat.description && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {cat.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {fmtDate(cat.createdAt)}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="btn btn-sm btn-secondary"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="btn btn-sm btn-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <Modal
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="login-form" style={{ gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="form-input"
                placeholder="e.g. Starters, Main Course, Drinks"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                rows={3}
                className="form-textarea"
                placeholder="Describe this category"
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.625rem',
                marginTop: '1rem',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '1rem',
              }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting
                  ? 'Saving…'
                  : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Categories;
