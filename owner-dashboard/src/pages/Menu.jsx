import { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { Plus, UtensilsCrossed, AlertCircle, Trash2, Clock } from 'lucide-react';

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

  const loadData = useCallback(
    async (catId) => {
      const isInitial = catId === undefined;
      if (isInitial) {
        setLoading(true);
      } else {
        setFilterLoading(true);
      }
      setError(null);
      setActionError(null);

      try {
        const catPromise =
          categories.length === 0 ? fetchApi('/api/categories') : Promise.resolve(categories);
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
    },
    [categories]
  );

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

  return (
    <div>
      <PageHeader
        title="Menu Management"
        subtitle="Organize dishes, set prices, and manage live availability"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Menu Item
          </button>
        }
      />

      {actionError && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Category filter pills */}
      <div className="filter-pills" style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => handleCategoryFilter('ALL')}
          disabled={filterLoading}
          className={`filter-pill${selectedCategory === 'ALL' ? ' active' : ''}`}
        >
          All Items ({menuItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            disabled={filterLoading}
            className={`filter-pill${selectedCategory === cat.id ? ' active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="state-container">
          <div className="spinner" />
          <span className="state-title">Loading menu items…</span>
        </div>
      )}

      {error && !loading && (
        <div>
          <div className="error-banner">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadData('ALL')}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filterLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              <div className="spinner" style={{ width: 14, height: 14 }} />
              Filtering menu items…
            </div>
          )}

          {!filterLoading && menuItems.length === 0 ? (
            <div className="state-container card">
              <UtensilsCrossed size={32} strokeWidth={1.25} style={{ opacity: 0.3 }} />
              <span className="state-title">No menu items found</span>
              <span className="state-desc">
                No items found for the selected category.
              </span>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="card hide-mobile" style={{ overflow: 'auto' }}>
                <table className="qs-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th style={{ textAlign: 'center' }}>Prep Time</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Availability</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              background: 'var(--surface-2)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {item.categoryName || '—'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ letterSpacing: '-0.01em' }}>{fmt(item.price)}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.preparationTime ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.8125rem',
                              }}
                            >
                              <Clock size={13} />
                              {item.preparationTime}m
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ maxWidth: 280, color: 'var(--text-secondary)' }}>
                          <span
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.875rem',
                            }}
                          >
                            {item.description || '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              letterSpacing: '0.03em',
                              backgroundColor: item.available
                                ? 'var(--success-light)'
                                : 'var(--danger-light)',
                              color: item.available ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: item.available
                                  ? 'var(--success)'
                                  : 'var(--danger)',
                              }}
                            />
                            {item.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                            <button
                              onClick={() => handleToggleAvailability(item.id)}
                              className={`btn btn-sm ${
                                item.available ? 'btn-warning' : 'btn-success'
                              }`}
                              title={item.available ? 'Mark Unavailable' : 'Mark Available'}
                            >
                              {item.available ? 'Mark Unavailable' : 'Mark Available'}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="btn btn-sm btn-danger"
                              aria-label="Delete item"
                            >
                              <Trash2 size={14} />
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
                {menuItems.map((item) => (
                  <div key={item.id} className="card card-body" style={{ padding: '1rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.375rem',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                        {item.categoryName && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-tertiary)',
                              textTransform: 'uppercase',
                              marginTop: '0.125rem',
                            }}
                          >
                            {item.categoryName}
                          </div>
                        )}
                      </div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--brand)' }}>
                        {fmt(item.price)}
                      </strong>
                    </div>

                    {item.description && (
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {item.description}
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
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: item.available ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: item.available
                              ? 'var(--success)'
                              : 'var(--danger)',
                          }}
                        />
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`btn btn-sm ${
                            item.available ? 'btn-warning' : 'btn-success'
                          }`}
                        >
                          {item.available ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="btn btn-sm btn-danger"
                          aria-label="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <Modal
          title="Add New Menu Item"
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleAddItemSubmit} className="login-form" style={{ gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="form-input"
                placeholder="e.g. Margherita Pizza"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="299.00"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prep Time (mins)</label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  min="1"
                  className="form-input"
                  placeholder="15"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                rows={3}
                className="form-textarea"
                placeholder="Fresh mozzarella, basil, and tomato sauce"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                maxLength={500}
                className="form-input"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
                style={{ width: 16, height: 16, accentColor: 'var(--brand)' }}
              />
              <label
                htmlFor="available"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                Available Immediately
              </label>
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
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Saving…' : 'Save Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Menu;
