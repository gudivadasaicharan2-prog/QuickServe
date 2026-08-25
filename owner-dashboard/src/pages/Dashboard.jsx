import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import fetchApi from '../utils/fetchApi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          totalMenuItems: menu.length,
          totalTables: tables.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
          pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="loading-spinner">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="error-message" style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatCard title="Total Categories" value={stats.totalCategories} />
        <StatCard title="Total Menu Items" value={stats.totalMenuItems} />
        <StatCard title="Total Tables" value={stats.totalTables} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
        <StatCard title="Pending Service Requests" value={stats.pendingRequests} />
      </div>
    </div>
  );
};

export default Dashboard;
