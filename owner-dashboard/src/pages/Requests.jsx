import React, { useState, useEffect, useCallback } from 'react';
import fetchApi from '../utils/fetchApi';

const REQUEST_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
};

const NEXT_STATUS_MAP = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
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

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Service Requests</h1>
        <p style={styles.loadingText}>Loading requests…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <h1>Service Requests</h1>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => loadRequests('ALL')} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Service Requests</h1>

      {/* Status filter tabs */}
      <div style={styles.filterRow}>
        {['ALL', ...REQUEST_STATUSES].map((s) => (
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

      {updateError && <p style={styles.errorText}>{updateError}</p>}
      {filterLoading && <p style={styles.loadingText}>Filtering…</p>}

      {/* Requests list */}
      {!filterLoading && requests.length === 0 ? (
        <p style={styles.emptyText}>No service requests found for status: {statusFilter}</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Table</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Notes</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const nextStatuses = NEXT_STATUS_MAP[req.status] || [];
              const isUpdating = updatingId === req.id;

              return (
                <tr key={req.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>#{req.id}</strong>
                  </td>
                  <td style={styles.td}>{req.tableNumber || '—'}</td>
                  <td style={styles.td}>
                    <strong>{req.requestType ? req.requestType.replace('_', ' ') : '—'}</strong>
                  </td>
                  <td style={styles.td}>{req.notes || '—'}</td>
                  <td style={styles.td}>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={styles.td}>{fmtDate(req.createdAt)}</td>
                  <td style={styles.td}>
                    {nextStatuses.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusUpdate(req.id, nextStatus)}
                        disabled={isUpdating}
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: STATUS_COLORS[nextStatus],
                        }}
                      >
                        {isUpdating ? '...' : `Mark ${nextStatus.replace('_', ' ')}`}
                      </button>
                    ))}
                    {nextStatuses.length === 0 && <span style={styles.completedText}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

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
  actionBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '0.5rem',
  },
  completedText: {
    color: '#9ca3af',
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
};

export default Requests;
