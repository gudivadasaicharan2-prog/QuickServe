import { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Plus, TableProperties, Users, QrCode, Edit2, Trash2, AlertCircle, Power } from 'lucide-react';

const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterLoading, setFilterLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
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
      setActionError(
        `Failed to ${editingTable ? 'update' : 'create'} table: ${err.message}`
      );
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
      setActionError(
        `Failed to ${table.active ? 'deactivate' : 'activate'} Table #${table.tableNumber}: ${err.message}`
      );
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
      setActionError(
        `Failed to update status for Table #${table.tableNumber}: ${err.message}`
      );
    }
  };

  const handleDelete = async (id, tableNumber) => {
    if (
      !window.confirm(`Are you sure you want to permanently delete Table #${tableNumber}?`)
    ) {
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

  return (
    <div>
      <PageHeader
        title="Tables Management"
        subtitle="Manage restaurant tables, seating capacity, QR identifiers, and occupancy"
        action={
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            Add Table
          </button>
        }
      />

      {actionError && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter pills */}
      <div className="filter-pills" style={{ marginBottom: '1.25rem' }}>
        {['ALL', ...TABLE_STATUSES].map((s) => (
          <button
            key={s}
            className={`filter-pill${statusFilter === s ? ' active' : ''}`}
            onClick={() => handleFilterChange(s)}
            disabled={filterLoading}
          >
            {s === 'ALL' ? 'All Tables' : s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="state-container">
          <div className="spinner" />
          <span className="state-title">Loading tables…</span>
        </div>
      )}

      {error && !loading && (
        <div>
          <div className="error-banner">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadTables('ALL')}>
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
              Filtering tables…
            </div>
          )}

          {!filterLoading && tables.length === 0 ? (
            <div className="state-container card">
              <TableProperties size={32} strokeWidth={1.25} style={{ opacity: 0.3 }} />
              <span className="state-title">No tables found</span>
              <span className="state-desc">No tables matching status: {statusFilter}</span>
            </div>
          ) : (
            <>
              {/* Responsive Grid layout for tables */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                {tables.map((tbl) => (
                  <div key={tbl.id} className="card card-body" style={{ padding: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                          Table {tbl.tableNumber}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8125rem',
                            marginTop: '0.2rem',
                          }}
                        >
                          <Users size={14} />
                          <span>{tbl.capacity} seats</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <StatusBadge status={tbl.status} />
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            color: tbl.active ? 'var(--success)' : 'var(--text-tertiary)',
                          }}
                        >
                          {tbl.active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* QR Identifier */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'var(--surface-2)',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                      }}
                    >
                      <QrCode size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <code style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {tbl.qrCode}
                      </code>
                    </div>

                    {/* Quick status change */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>
                        Change Status
                      </label>
                      <select
                        value={tbl.status}
                        onChange={(e) => handleQuickStatusChange(tbl, e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                      >
                        {TABLE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '0.75rem',
                      }}
                    >
                      <button
                        onClick={() => handleToggleActive(tbl)}
                        className={`btn btn-sm ${tbl.active ? 'btn-secondary' : 'btn-success'}`}
                        title={tbl.active ? 'Deactivate table' : 'Activate table'}
                      >
                        <Power size={13} />
                        {tbl.active ? 'Deactivate' : 'Activate'}
                      </button>

                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(tbl)}
                          className="btn btn-sm btn-secondary"
                          aria-label="Edit table"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(tbl.id, tbl.tableNumber)}
                          className="btn btn-sm btn-danger"
                          aria-label="Delete table"
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
        </>
      )}

      {/* Add / Edit Table Modal */}
      {modalOpen && (
        <Modal
          title={editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Add New Table'}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="login-form" style={{ gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Table Number *</label>
                <input
                  type="number"
                  name="tableNumber"
                  value={formData.tableNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="form-input"
                  placeholder="e.g. 1"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (Seats) *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="form-input"
                  placeholder="e.g. 4"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">QR Code Identifier *</label>
              <input
                type="text"
                name="qrCode"
                value={formData.qrCode}
                onChange={handleInputChange}
                required
                maxLength={500}
                className="form-input"
                placeholder="e.g. QS-TABLE-001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                {TABLE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
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
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                style={{ width: 16, height: 16, accentColor: 'var(--brand)' }}
              />
              <label
                htmlFor="active"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                Active (Available for customer orders)
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
                  : editingTable
                  ? 'Update Table'
                  : 'Create Table'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Tables;
