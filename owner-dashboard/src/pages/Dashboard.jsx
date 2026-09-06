import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import fetchApi from '../utils/fetchApi';
import {
  Tag,
  UtensilsCrossed,
  TableProperties,
  ClipboardList,
  Clock,
  Bell,
} from 'lucide-react';

const STAT_CONFIG = [
  { key: 'totalCategories', label: 'Total Categories', icon: Tag,              color: 'brand'   },
  { key: 'totalMenuItems',  label: 'Menu Items',       icon: UtensilsCrossed,  color: 'info'    },
  { key: 'totalTables',     label: 'Tables',           icon: TableProperties,  color: 'purple'  },
  { key: 'totalOrders',     label: 'Total Orders',     icon: ClipboardList,    color: 'brand'   },
  { key: 'pendingOrders',   label: 'Pending Orders',   icon: Clock,            color: 'warning' },
  { key: 'pendingRequests', label: 'Pending Requests', icon: Bell,             color: 'danger'  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categories, menu, tables, orders, requests] = await Promise.all([
        fetchApi('/api/categories'),
        fetchApi('/api/menu'),
        fetchApi('/api/tables'),
        fetchApi('/api/orders'),
        fetchApi('/api/requests'),
      ]);
      setStats({
        totalCategories: categories.length,
        totalMenuItems:  menu.length,
        totalTables:     tables.length,
        totalOrders:     orders.length,
        pendingOrders:   orders.filter(o => o.status === 'PENDING').length,
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Restaurant overview"
      />

      {loading && (
        <div className="stat-cards-grid">
          {STAT_CONFIG.map(({ key }) => (
            <div key={key} className="card stat-card">
              <div className="card-body stat-card__body">
                <div style={{ height: 80, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s ease infinite' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div>
          <div className="error-banner">
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadStats}>
            Retry
          </button>
        </div>
      )}

      {stats && !loading && (
        <div className="stat-cards-grid">
          {STAT_CONFIG.map(({ key, label, icon, color }) => (
            <StatCard
              key={key}
              title={label}
              value={stats[key]}
              icon={icon}
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
