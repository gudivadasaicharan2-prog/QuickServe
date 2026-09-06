const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div className="page-header__text">
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </div>
    {action && <div className="page-header__action">{action}</div>}
  </div>
);

export default PageHeader;
