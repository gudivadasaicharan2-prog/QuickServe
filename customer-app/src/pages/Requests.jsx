import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { createServiceRequest, fetchServiceRequests } from '../services/requestService';
import {
  Bell,
  Receipt,
  Utensils,
  Sparkles,
  GlassWater,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const ACTIONS = [
  {
    type: 'CALL_WAITER',
    title: 'Call Waiter',
    description: 'Ask our staff to visit your table for assistance',
    icon: Bell,
    color: 'var(--brand)',
  },
  {
    type: 'REQUEST_BILL',
    title: 'Request Bill',
    description: 'Get your bill prepared and brought to your table',
    icon: Receipt,
    color: 'var(--brand)',
  },
  {
    type: 'CUTLERY',
    title: 'Extra Cutlery',
    description: 'Request additional spoons, forks, knives, or plates',
    icon: Utensils,
    color: 'var(--brand)',
  },
  {
    type: 'TISSUE',
    title: 'Tissue & Napkins',
    description: 'Request fresh paper napkins or wet tissues',
    icon: Sparkles,
    color: 'var(--brand)',
  },
  {
    type: 'WATER',
    title: 'Drinking Water',
    description: 'Request complimentary drinking water for the table',
    icon: GlassWater,
    color: 'var(--brand)',
  },
];

const Requests = () => {
  const { tableNumber } = useCart();
  const { sessionTable, sessionToken, markSessionClosed } = useSession();
  const effectiveTable = sessionTable || tableNumber || '1';

  const [submittingType, setSubmittingType] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadRequests = async () => {
    try {
      const data = await fetchServiceRequests();
      setRecentRequests(data);
    } catch {
      // Silently catch in customer view if network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSendRequest = async (actionType, title) => {
    setSubmittingType(actionType);
    setError(null);
    setSuccessMessage(null);

    try {
      await createServiceRequest(
        {
          tableNumber: String(effectiveTable),
          requestType: actionType,
          notes: `Customer request from Table ${effectiveTable}`,
        },
        sessionToken
      );

      if (actionType === 'REQUEST_BILL') {
        markSessionClosed();
        return;
      }

      setSuccessMessage(`${title} sent! Our staff is on the way.`);
      loadRequests();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send request. Please call staff directly.');
    } finally {
      setSubmittingType(null);
    }
  };

  const activeTableRequests = recentRequests.filter(
    (r) =>
      String(r.tableNumber).trim() === String(tableNumber).trim() &&
      r.status !== 'COMPLETED'
  );

  return (
    <div className="customer-requests-screen">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Table Assistance
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Request service for Table <strong>{tableNumber}</strong> with a single tap
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--success-light)',
            color: 'var(--success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem',
            animation: 'fadeIn 200ms ease',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Active pending requests banner if any */}
      {activeTableRequests.length > 0 && (
        <div
          className="card card-body"
          style={{
            background: 'var(--brand-light)',
            borderColor: 'var(--brand)',
            marginBottom: '1rem',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Requests for Table {tableNumber}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
            {activeTableRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                }}
              >
                <span>
                  <strong>{req.requestType?.replace('_', ' ')}</strong>
                </span>
                <span
                  style={{
                    background: req.status === 'IN_PROGRESS' ? '#DBEAFE' : '#FEF3C7',
                    color: req.status === 'IN_PROGRESS' ? '#1E40AF' : '#92400E',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  {req.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {ACTIONS.map(({ type, title, description, icon: Icon }) => {
          const isSending = submittingType === type;

          return (
            <div
              key={type}
              className="card card-body"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                    {description}
                  </p>
                </div>
              </div>

              <button
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0, minWidth: 80 }}
                onClick={() => handleSendRequest(type, title)}
                disabled={isSending}
              >
                {isSending ? (
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                ) : (
                  'Request'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
