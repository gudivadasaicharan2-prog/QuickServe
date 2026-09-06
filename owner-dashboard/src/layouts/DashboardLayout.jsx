import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import NotificationBell from '../components/NotificationBell';
import './DashboardLayout.css';

const DashboardLayout = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <MobileNav />
    <main className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__spacer" />
        <div className="dashboard-topbar__actions">
          <NotificationBell />
        </div>
      </header>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </main>
  </div>
);

export default DashboardLayout;
