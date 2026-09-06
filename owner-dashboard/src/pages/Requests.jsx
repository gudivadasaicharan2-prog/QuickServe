import { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { RefreshCw, Bell, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const REQUEST_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const NEXT_STATUS_MAP = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterLoading, setFilterLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const loadRequests = useCallback(async (filter) => {
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
          ? '/api/requests'
          : `/api/requests/status/${filter}`;
      const data = await fetchApi(endpoint);
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests('ALL');
  }, [loadRequests]);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    loadRequests(filter);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    setUpdateError(null);
    try {
      const updated = await fetchApi(`/api/requests/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      setUpdateError(`Failed to update request #${id}: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Service Requests"
        subtitle="Manage customer requests for waiter, bill, cutlery, and assistance"
        action={
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadRequests(statusFilter)}
            aria-label="Refresh requests"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      {/* Filter pills */}
      <div className="filter-pills" style={{ marginBottom: '1.25rem' }}>
        {['ALL', ...REQUEST_STATUSES].map((s) => (
          <button
            key={s}
            className={`filter-pill${statusFilter === s ? ' active' : ''}`}
            onClick={() => handleFilterChange(s)}
            disabled={filterLoading}
          >
            {s === 'ALL' ? 'All Requests' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {updateError && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{updateError}</span>
        </div>
      )}

      {loading && (
        <div className="state-container">
          <div className="spinner" />
          <span className="state-title">Loading service requests…</span>
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
            onClick={() => loadRequests(statusFilter)}
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
              Filtering requests…
            </div>
          )}

          {!filterLoading && requests.length === 0 ? (
            <div className="state-container card">
              <Bell size={32} strokeWidth={1.25} style={{ opacity: 0.3 }} />
              <span className="state-title">No service requests found</span>
              <span className="state-desc">
                No requests matching status: {statusFilter.replace('_', ' ')}
              </span>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="card hide-mobile" style={{ overflow: 'auto' }}>
                <table className="qs-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Table</th>
                      <th>Type</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const nextStatuses = NEXT_STATUS_MAP[req.status] || [];
                      const isUpdating = updatingId === req.id;

                      return (
                        <tr key={req.id}>
                          <td>
                            <strong>#{req.id}</strong>
                          </td>
                          <td>{req.tableNumber ? `Table ${req.tableNumber}` : '—'}</td>
                          <td>
                            <strong style={{ letterSpacing: '0.01em' }}>
                              {req.requestType ? req.requestType.replace('_', ' ') : '—'}
                            </strong>
                          </td>
                          <td style={{ color: req.notes ? 'var(--text-primary)' : 'var(--text-tertiary)', maxWidth: 280 }}>
                            {req.notes || 'No instructions'}
                          </td>
                          <td>
                            <StatusBadge status={req.status} />
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {fmtDate(req.createdAt)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {nextStatuses.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => handleStatusUpdate(req.id, nextStatus)}
                                disabled={isUpdating}
                                className={`btn btn-sm ${
                                  nextStatus === 'COMPLETED' ? 'btn-success' : 'btn-primary'
                                }`}
                              >
                                {isUpdating ? (
                                  'Updating…'
                                ) : (
                                  <>
                                    <span>Mark {nextStatus.replace('_', ' ')}</span>
                                    <ArrowRight size={13} />
                                  </>
                                )}
                              </button>
                            ))}
                            {nextStatuses.length === 0 && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.8125rem',
                                  color: 'var(--success)',
                                  fontWeight: 500,
                                }}
                              >
                                <CheckCircle2 size={15} /> Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="show-mobile" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                {requests.map((req) => {
                  const nextStatuses = NEXT_STATUS_MAP[req.status] || [];
                  const isUpdating = updatingId === req.id;

                  return (
                    <div key={req.id} className="card card-body" style={{ padding: '1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div>
                          <strong>#{req.id}</strong> —{' '}
                          <span style={{ fontWeight: 600 }}>
                            {req.requestType ? req.requestType.replace('_', ' ') : 'Request'}
                          </span>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>

                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.625rem',
                        }}
                      >
                        <span>{req.tableNumber ? `Table ${req.tableNumber}` : 'No table assigned'}</span>
                      </div>

                      {req.notes && (
                        <div
                          style={{
                            background: 'var(--surface-2)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            marginBottom: '0.75rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <strong>Notes: </strong>
                          {req.notes}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '0.75rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                          {fmtDate(req.createdAt)}
                        </span>
                        <div>
                          {nextStatuses.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() => handleStatusUpdate(req.id, nextStatus)}
                              disabled={isUpdating}
                              className={`btn btn-sm ${
                                nextStatus === 'COMPLETED' ? 'btn-success' : 'btn-primary'
                              }`}
                            >
                              {isUpdating ? 'Updating…' : `Mark ${nextStatus.replace('_', ' ')}`}
                            </button>
                          ))}
                          {nextStatuses.length === 0 && (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--success)' }}>
                              ✓ Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Requests;
