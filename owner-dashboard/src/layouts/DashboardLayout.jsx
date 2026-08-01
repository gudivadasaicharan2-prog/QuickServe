import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
const DashboardLayout = () => (
  <div className="layout">
    <Sidebar />
    <main><Outlet /></main>
  </div>
);
export default DashboardLayout;
