import React from 'react';
import StatCard from '../components/StatCard';
const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <StatCard title="Total Sales" value="$1200" />
      <StatCard title="Total Orders" value="45" />
    </div>
  </div>
);
export default Dashboard;
