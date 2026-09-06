const STATUS_STYLES = {
  // Orders
  PENDING:   { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' },
  PREPARING: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  READY:     { bg: '#EDE9FE', text: '#5B21B6', dot: '#7C3AED' },
  SERVED:    { bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  COMPLETED: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  // Requests
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  // Tables
  AVAILABLE: { bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  OCCUPIED:  { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' },
  RESERVED:  { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  // Active
  ACTIVE:   { bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  INACTIVE: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
};

const DARK_STATUS_STYLES = {
  PENDING:     { bg: 'rgba(217,119,6,0.15)',  text: '#FCD34D', dot: '#D97706' },
  PREPARING:   { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD', dot: '#3B82F6' },
  READY:       { bg: 'rgba(124,58,237,0.15)', text: '#C4B5FD', dot: '#7C3AED' },
  SERVED:      { bg: 'rgba(5,150,105,0.15)',  text: '#6EE7B7', dot: '#059669' },
  COMPLETED:   { bg: 'rgba(107,114,128,0.15)',text: '#9CA3AF', dot: '#6B7280' },
  CANCELLED:   { bg: 'rgba(220,38,38,0.15)',  text: '#FCA5A5', dot: '#EF4444' },
  IN_PROGRESS: { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD', dot: '#3B82F6' },
  AVAILABLE:   { bg: 'rgba(5,150,105,0.15)',  text: '#6EE7B7', dot: '#059669' },
  OCCUPIED:    { bg: 'rgba(217,119,6,0.15)',  text: '#FCD34D', dot: '#D97706' },
  RESERVED:    { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD', dot: '#3B82F6' },
  ACTIVE:      { bg: 'rgba(5,150,105,0.15)',  text: '#6EE7B7', dot: '#059669' },
  INACTIVE:    { bg: 'rgba(107,114,128,0.15)',text: '#9CA3AF', dot: '#6B7280' },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const styles = (isDark ? DARK_STATUS_STYLES : STATUS_STYLES)[status] || {
    bg: '#F3F4F6',
    text: '#374151',
    dot: '#9CA3AF',
  };

  const label = status?.replace(/_/g, ' ') || '—';
  const fontSize = size === 'sm' ? '0.7rem' : '0.8125rem';
  const padding = size === 'sm' ? '0.2rem 0.55rem' : '0.3rem 0.75rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding,
        borderRadius: '9999px',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        backgroundColor: styles.bg,
        color: styles.text,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          borderRadius: '50%',
          backgroundColor: styles.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
