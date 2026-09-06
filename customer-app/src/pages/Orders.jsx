import { useState, useEffect } from 'react';
import { fetchOrders } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { ClipboardList, RefreshCw, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
  PENDING:   { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' },
  PREPARING: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  READY:     { bg: '#EDE9FE', text: '#5B21B6', dot: '#7C3AED' },
  SERVED:    { bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  COMPLETED: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

const fmt = (amount) => (amount != null ? `₹${Number(amount).toFixed(2)}` : '—');
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

const Orders = () => {
  const { tableNumber } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTableOnly, setFilterTableOnly] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const displayedOrders = filterTableOnly && tableNumber
    ? orders.filter(
        (o) => String(o.tableNumber).trim() === String(tableNumber).trim()
      )
    : orders;

  return (
    <div className="customer-orders-screen">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Your Orders
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Order status and history for your table
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={loadOrders}
          disabled={loading}
          aria-label="Refresh orders"
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter toggle: Table vs All */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <button
          className={`category-pill${filterTableOnly ? ' active' : ''}`}
          onClick={() => setFilterTableOnly(true)}
        >
          Table {tableNumber} Only
        </button>
        <button
          className={`category-pill${!filterTableOnly ? ' active' : ''}`}
          onClick={() => setFilterTableOnly(false)}
        >
          All Orders ({orders.length})
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="state-container">
          <div className="spinner" />
          <span style={{ fontSize: '0.875rem' }}>Fetching orders…</span>
        </div>
      )}

      {!loading && !error && displayedOrders.length === 0 && (
        <div className="state-container card" style={{ padding: '3rem 1rem' }}>
          <ClipboardList size={40} strokeWidth={1.25} style={{ opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.5rem' }}>
            No orders found
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {filterTableOnly
              ? `No active orders placed for Table ${tableNumber} yet.`
              : 'No orders recorded in the system yet.'}
          </p>
        </div>
      )}

      {!loading && !error && displayedOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {displayedOrders.map((order) => {
            const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;

            return (
              <div key={order.id} className="card card-body" style={{ padding: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.625rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Order #{order.orderNumber || order.id}
                    </strong>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Table {order.tableNumber || '—'}
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: statusStyle.dot,
                      }}
                    />
                    {order.status}
                  </span>
                </div>

                {/* Items preview */}
                {order.items && order.items.length > 0 && (
                  <div
                    style={{
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.8125rem',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span>
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {it.quantity}×
                          </strong>{' '}
                          {it.menuItemName}
                        </span>
                        <span>{fmt(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.specialInstructions && (
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      marginBottom: '0.625rem',
                    }}
                  >
                    "{order.specialInstructions}"
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '0.625rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {fmtDate(order.createdAt)}
                  </span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {fmt(order.totalAmount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
