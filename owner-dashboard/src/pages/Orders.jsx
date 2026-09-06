import { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { RefreshCw, Eye, AlertCircle, ClipboardList } from 'lucide-react';

const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];

const NEXT_STATUS_MAP = {
  PENDING:   ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY:     ['SERVED'],
  SERVED:    ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_BTN_CLASS = {
  PREPARING: 'btn btn-sm btn-primary',
  READY:     'btn btn-sm btn-success',
  SERVED:    'btn btn-sm btn-success',
  COMPLETED: 'btn btn-sm btn-secondary',
  CANCELLED: 'btn btn-sm btn-danger',
};

const fmt = amount => amount != null ? `₹${Number(amount).toFixed(2)}` : '—';
const fmtDate = d => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/* ── Order Details Modal ──────────────────────────────────────── */
const OrderModal = ({ order, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
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
    <Modal
      title={`Order ${order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}`}
      onClose={onClose}
      footer={
        nextStatuses.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: 'auto' }}>
              Update status:
            </span>
            {nextStatuses.map(s => (
              <button
                key={s}
                className={STATUS_BTN_CLASS[s] || 'btn btn-sm btn-secondary'}
                onClick={() => handleStatusChange(s)}
                disabled={updating}
              >
                {updating ? '…' : s}
              </button>
            ))}
          </div>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        )
      }
    >
      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          ['Table', order.tableNumber || '—'],
          ['Status', <StatusBadge key="s" status={order.status} size="md" />],
          ['Total', <strong key="t">{fmt(order.totalAmount)}</strong>],
          ['Placed', fmtDate(order.createdAt)],
        ].map(([label, value]) => (
          <div key={label}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{label}</p>
            <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Notes: </strong>{order.specialInstructions}
        </div>
      )}

      {/* Items */}
      <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>Order Items</p>
      {order.items && order.items.length > 0 ? (
        <table className="qs-table" style={{ marginBottom: '0.5rem' }}>
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td>{item.menuItemName}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{fmt(item.unitPrice)}</td>
                <td style={{ textAlign: 'right' }}><strong>{fmt(item.subtotal)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, paddingTop: '0.75rem', borderTop: '1.5px solid var(--border)' }}>Total</td>
              <td style={{ textAlign: 'right', fontWeight: 600, paddingTop: '0.75rem', borderTop: '1.5px solid var(--border)' }}>{fmt(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No items found.</p>
      )}

      {updateError && (
        <div className="error-banner" style={{ marginTop: '1rem' }}>
          <AlertCircle size={14} />{updateError}
        </div>
      )}
    </Modal>
  );
};

/* ── Main Orders Component ────────────────────────────────────── */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  const loadOrders = useCallback(async (filter) => {
    const isInitial = filter === undefined;
    if (isInitial) setLoading(true); else setFilterLoading(true);
    setError(null);
    try {
      const endpoint = filter === 'ALL' || filter === undefined
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

  useEffect(() => { loadOrders('ALL'); }, [loadOrders]);

  const handleFilterChange = filter => {
    setStatusFilter(filter);
    loadOrders(filter);
  };

  const handleStatusUpdate = updatedOrder => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  const openDetails = async (order) => {
    try {
      const full = await fetchApi(`/api/orders/${order.id}`);
      setSelectedOrder(full);
    } catch {
      setSelectedOrder(order);
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Manage and track all customer orders"
        action={
          <button className="btn btn-secondary btn-sm" onClick={() => loadOrders(statusFilter)} aria-label="Refresh">
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {/* Filter pills */}
      <div className="filter-pills" style={{ marginBottom: '1.25rem' }}>
        {['ALL', ...ORDER_STATUSES].map(s => (
          <button
            key={s}
            className={`filter-pill${statusFilter === s ? ' active' : ''}`}
            onClick={() => handleFilterChange(s)}
            disabled={filterLoading}
          >
            {s === 'ALL' ? 'All Orders' : s}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="state-container">
          <div className="spinner" />
          <span className="state-title">Loading orders…</span>
        </div>
      )}

      {error && !loading && (
        <div>
          <div className="error-banner"><AlertCircle size={15} />{error}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadOrders(statusFilter)}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filterLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <div className="spinner" style={{ width: 14, height: 14 }} />
              Filtering…
            </div>
          )}

          {!filterLoading && orders.length === 0 ? (
            <div className="state-container card">
              <ClipboardList size={32} strokeWidth={1.25} style={{ opacity: 0.3 }} />
              <span className="state-title">No orders found</span>
              <span className="state-desc">No orders for status: {statusFilter}</span>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="card hide-mobile" style={{ overflow: 'auto' }}>
                <table className="qs-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Table</th>
                      <th style={{ textAlign: 'center' }}>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Placed At</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}</strong></td>
                        <td>{order.tableNumber || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{order.items ? order.items.length : '—'}</td>
                        <td><strong>{fmt(order.totalAmount)}</strong></td>
                        <td><StatusBadge status={order.status} /></td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{fmtDate(order.createdAt)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openDetails(order)}>
                            <Eye size={13} />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="show-mobile" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map(order => (
                  <div key={order.id} className="card card-body" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <strong>{order.orderNumber ? `Order #${order.orderNumber}` : `Order #${order.id}`}</strong>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span>Table {order.tableNumber || '—'}</span>
                      <span>{order.items ? order.items.length : '—'} items</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{fmt(order.totalAmount)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{fmtDate(order.createdAt)}</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetails(order)}>
                        <Eye size={13} />Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default Orders;
