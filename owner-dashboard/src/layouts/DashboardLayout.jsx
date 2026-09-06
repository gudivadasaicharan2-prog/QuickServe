import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import './DashboardLayout.css';

const DashboardLayout = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <MobileNav />
    <main className="dashboard-main">
      <div className="dashboard-content">
        <Outlet />
      </div>
    </main>
  </div>
);

export default DashboardLayout;
