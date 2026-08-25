import React, { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';

// All OrderStatus values exactly as defined by the Java backend
const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];

// Next logical statuses to transition to, per current status
const NEXT_STATUS_MAP = {
  PENDING:   ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY',     'CANCELLED'],
  READY:     ['SERVED'],
  SERVED:    ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_COLORS = {
  PENDING:   '#f59e0b',
  PREPARING: '#3b82f6',
  READY:     '#8b5cf6',
  SERVED:    '#10b981',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount) =>
  amount != null ? `₹${Number(amount).toFixed(2)}` : '—';

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span style={{
    ...styles.badge,
    backgroundColor: STATUS_COLORS[status] || '#6b7280',
  }}>
    {status}
  </span>
);

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  if (!order) return null;

  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const updated = await fetchApi(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      onStatusUpdate(updated);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Order #{order.orderNumber || order.id}</h2>
            <p style={styles.modalSubtitle}>Table: {order.tableNumber || '—'}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Status row */}
        <div style={styles.modalRow}>
          <span style={styles.label}>Status:</span>
          <StatusBadge status={order.status} />
        </div>
        <div style={styles.modalRow}>
          <span style={styles.label}>Total:</span>
          <strong>{fmt(order.totalAmount)}</strong>
        </div>
        <div style={styles.modalRow}>
          <span style={styles.label}>Placed:</span>
          <span>{fmtDate(order.createdAt)}</span>
        </div>
        {order.specialInstructions && (
          <div style={styles.modalRow}>
            <span style={styles.label}>Notes:</span>
            <span>{order.specialInstructions}</span>
          </div>
        )}

        {/* Items table */}
        <h3 style={styles.sectionTitle}>Order Items</h3>
        {order.items && order.items.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Unit Price</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{item.menuItemName}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>{fmt(item.unitPrice)}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                  Total
                </td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                  {fmt(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p style={{ color: '#6b7280' }}>No items found.</p>
        )}

        {/* Status update actions */}
        {nextStatuses.length > 0 && (
          <div style={styles.actions}>
            <span style={styles.label}>Update Status:</span>
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating}
                style={{ ...styles.actionBtn, backgroundColor: STATUS_COLORS[s] }}
              >
                {updating ? '...' : `→ ${s}`}
              </button>
            ))}
          </div>
        )}
        {updateError && <p style={styles.errorText}>{updateError}</p>}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  // Fetch orders — all or by status
  const loadOrders = useCallback(async (filter) => {
    const isInitial = filter === undefined;
    if (isInitial) {
      setLoading(true);
    } else {
      setFilterLoading(true);
    }
    setError(null);
    try {
      const endpoint =
        filter === 'ALL' || filter === undefined
          ? '/api/orders'
          : `/api/orders/status/${filter}`;
      const data = await fetchApi(endpoint);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadOrders('ALL');
  }, [loadOrders]);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    loadOrders(filter);
  };

  // Called by modal after a successful status PATCH
  const handleStatusUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    setSelectedOrder(updatedOrder);
  };

  const openDetails = async (order) => {
    try {
      // Fetch full details (includes items) in case list response is summary-only
      const full = await fetchApi(`/api/orders/${order.id}`);
      setSelectedOrder(full);
    } catch {
      // Fallback to the already-fetched order object
      setSelectedOrder(order);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Orders</h1>
        <p style={styles.loadingText}>Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <h1>Orders</h1>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => loadOrders('ALL')} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Orders</h1>

      {/* Status filter tabs */}
      <div style={styles.filterRow}>
        {['ALL', ...ORDER_STATUSES].map((s) => (
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

      {/* Orders list */}
      {!filterLoading && orders.length === 0 ? (
        <p style={styles.emptyText}>No orders found for status: {statusFilter}</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order #</th>
              <th style={styles.th}>Table</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Placed At</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{order.orderNumber || `#${order.id}`}</strong>
                </td>
                <td style={styles.td}>{order.tableNumber || '—'}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  {order.items ? order.items.length : '—'}
                </td>
                <td style={styles.td}>{fmt(order.totalAmount)}</td>
                <td style={styles.td}>
                  <StatusBadge status={order.status} />
                </td>
                <td style={styles.td}>{fmtDate(order.createdAt)}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => openDetails(order)}
                    style={styles.viewBtn}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    padding: '1.5rem',
    fontFamily: 'sans-serif',
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
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    letterSpacing: '0.02em',
  },
  viewBtn: {
    padding: '0.3rem 0.7rem',
    fontSize: '0.8rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loadingText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#dc2626',
    marginTop: '0.5rem',
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
    maxWidth: '640px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    margin: '0.25rem 0 0',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#6b7280',
    lineHeight: 1,
  },
  modalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    minWidth: '70px',
  },
  sectionTitle: {
    marginTop: '1.25rem',
    marginBottom: '0.6rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.4rem',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginTop: '1.25rem',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '6px',
  },
  actionBtn: {
    padding: '0.4rem 0.9rem',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
};

export default Orders;
