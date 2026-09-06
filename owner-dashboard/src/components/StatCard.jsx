const StatCard = ({ title, value, icon: Icon, color = 'brand', trend }) => {
  const colorMap = {
    brand:   { bg: 'var(--brand-light)', icon: 'var(--brand)' },
    success: { bg: 'var(--success-light)', icon: 'var(--success)' },
    warning: { bg: 'var(--warning-light)', icon: 'var(--warning)' },
    danger:  { bg: 'var(--danger-light)', icon: 'var(--danger)' },
    info:    { bg: 'var(--info-light)', icon: 'var(--info)' },
    purple:  { bg: 'var(--purple-light)', icon: 'var(--purple)' },
  };

  const colors = colorMap[color] || colorMap.brand;

  return (
    <div className="stat-card card">
      <div className="stat-card__body card-body">
        <div className="stat-card__top">
          <p className="stat-card__label">{title}</p>
          {Icon && (
            <div
              className="stat-card__icon"
              style={{ background: colors.bg, color: colors.icon }}
              aria-hidden="true"
            >
              <Icon size={18} strokeWidth={1.75} />
            </div>
          )}
        </div>
        <div className="stat-card__value">{value ?? '—'}</div>
      </div>
    </div>
  );
};

export default StatCard;
