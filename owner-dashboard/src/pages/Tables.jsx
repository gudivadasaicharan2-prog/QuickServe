import React, { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';

const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];

const STATUS_COLORS = {
  AVAILABLE: '#10b981',
  OCCUPIED: '#f59e0b',
  RESERVED: '#3b82f6',
};

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
};

const StatusBadge = ({ status }) => (
  <span
    style={{
      ...styles.badge,
      backgroundColor: STATUS_COLORS[status] || '#6b7280',
    }}
  >
    {status}
  </span>
);

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterLoading, setFilterLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null); // null when adding, table object when editing
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    qrCode: '',
    status: 'AVAILABLE',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadTables = useCallback(async (filter) => {
    const isInitial = filter === undefined;
    if (isInitial) {
      setLoading(true);
    } else {
      setFilterLoading(true);
    }
    setError(null);
    setActionError(null);

    try {
      const endpoint =
        !filter || filter === 'ALL'
          ? '/api/tables'
          : `/api/tables/status/${filter}`;
      const data = await fetchApi(endpoint);
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables('ALL');
  }, [loadTables]);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    loadTables(filter);
  };

  const handleOpenAddModal = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: '4',
      qrCode: '',
      status: 'AVAILABLE',
      active: true,
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      qrCode: table.qrCode,
      status: table.status,
      active: table.active ?? true,
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTable(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Auto-suggest QR code when tableNumber changes and user is adding a table
      if (name === 'tableNumber' && !editingTable && value) {
        updated.qrCode = `QS-TABLE-${String(value).padStart(3, '0')}`;
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const payload = {
      tableNumber: parseInt(formData.tableNumber, 10),
      capacity: parseInt(formData.capacity, 10),
      qrCode: formData.qrCode.trim(),
      status: formData.status,
      active: formData.active,
    };

    try {
      if (editingTable) {
        // Update existing table (PUT /api/tables/{id})
        const updated = await fetchApi(`/api/tables/${editingTable.id}`, {
          method: 'PUT',
          body: payload,
        });
        setTables((prev) =>
          prev
            .map((t) => (t.id === editingTable.id ? updated : t))
            .sort((a, b) => a.tableNumber - b.tableNumber)
        );
      } else {
        // Create new table (POST /api/tables)
        const created = await fetchApi('/api/tables', {
          method: 'POST',
          body: payload,
        });
        setTables((prev) =>
          [...prev, created].sort((a, b) => a.tableNumber - b.tableNumber)
        );
      }
      handleCloseModal();
    } catch (err) {
      setActionError(`Failed to ${editingTable ? 'update' : 'create'} table: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (table) => {
    setActionError(null);
    try {
      const endpoint = table.active
        ? `/api/tables/${table.id}/deactivate`
        : `/api/tables/${table.id}/activate`;
      const updated = await fetchApi(endpoint, { method: 'PATCH' });
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? updated : t))
      );
    } catch (err) {
      setActionError(`Failed to ${table.active ? 'deactivate' : 'activate'} Table #${table.tableNumber}: ${err.message}`);
    }
  };

  const handleQuickStatusChange = async (table, newStatus) => {
    if (table.status === newStatus) return;
    setActionError(null);
    try {
      const payload = {
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        qrCode: table.qrCode,
        status: newStatus,
        active: table.active,
      };
      const updated = await fetchApi(`/api/tables/${table.id}`, {
        method: 'PUT',
        body: payload,
      });
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? updated : t))
      );
    } catch (err) {
      setActionError(`Failed to update status for Table #${table.tableNumber}: ${err.message}`);
    }
  };

  const handleDelete = async (id, tableNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Table #${tableNumber}?`)) {
      return;
    }
    setActionError(null);
    try {
      await fetchApi(`/api/tables/${id}`, { method: 'DELETE' });
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setActionError(`Failed to delete Table #${tableNumber}: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Tables Management</h1>
        <p style={styles.loadingText}>Loading tables…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <h1>Tables Management</h1>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => loadTables('ALL')} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1>Tables Management</h1>
        <button onClick={handleOpenAddModal} style={styles.addBtn}>
          + Add Table
        </button>
      </div>

      {actionError && <p style={styles.errorText}>{actionError}</p>}

      {/* Status filter tabs */}
      <div style={styles.filterRow}>
        {['ALL', ...TABLE_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            disabled={filterLoading}
            style={{
              ...styles.filterBtn,
              ...(statusFilter === s ? styles.filterBtnActive : {}),
              ...(s !== 'ALL' ? { borderBottom: `3px solid ${STATUS_COLORS[s]}` } : {}),
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {filterLoading && <p style={styles.loadingText}>Filtering…</p>}

      {/* Tables list */}
      {!filterLoading && tables.length === 0 ? (
        <p style={styles.emptyText}>No tables found for status: {statusFilter}</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Table #</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Capacity</th>
              <th style={styles.th}>QR Code</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Active</th>
              <th style={styles.th}>Created At</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((tbl) => (
              <tr key={tbl.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>Table #{tbl.tableNumber}</strong>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  {tbl.capacity} seats
                </td>
                <td style={styles.td}>
                  <code style={styles.code}>{tbl.qrCode}</code>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <select
                    value={tbl.status}
                    onChange={(e) => handleQuickStatusChange(tbl, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      backgroundColor: STATUS_COLORS[tbl.status] || '#6b7280',
                    }}
                  >
                    {TABLE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: tbl.active ? '#10b981' : '#9ca3af',
                    }}
                  >
                    {tbl.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>{fmtDate(tbl.createdAt)}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleActive(tbl)}
                    style={{
                      ...styles.actionBtn,
                      backgroundColor: tbl.active ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {tbl.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(tbl)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tbl.id, tbl.tableNumber)}
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

      {/* Add / Edit Table Modal */}
      {modalOpen && (
        <div style={styles.overlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTable ? `Edit Table #${editingTable.tableNumber}` : 'Add New Table'}
              </h2>
              <button onClick={handleCloseModal} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Table Number *</label>
                  <input
                    type="number"
                    name="tableNumber"
                    value={formData.tableNumber}
                    onChange={handleInputChange}
                    required
                    min="1"
                    style={styles.input}
                    placeholder="e.g. 1"
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Capacity (Seats) *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    style={styles.input}
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>QR Code Identifier *</label>
                <input
                  type="text"
                  name="qrCode"
                  value={formData.qrCode}
                  onChange={handleInputChange}
                  required
                  maxLength={500}
                  style={styles.input}
                  placeholder="e.g. QS-TABLE-001"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Initial Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  {TABLE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.inputGroup, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <label htmlFor="active" style={{ ...styles.label, marginBottom: 0, cursor: 'pointer' }}>
                  Active (Available for customer orders)
                </label>
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
                  {submitting ? 'Saving…' : editingTable ? 'Update Table' : 'Create Table'}
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
  code: {
    background: '#f3f4f6',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#1f2937',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
  },
  statusSelect: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  actionBtn: {
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '0.5rem',
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

export default Tables;
