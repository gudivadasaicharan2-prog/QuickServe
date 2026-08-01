import React from 'react';
import { Link } from 'react-router-dom';
const Sidebar = () => (
  <aside className="sidebar">
    <ul>
      <li><Link to="/">Dashboard</Link></li>
      <li><Link to="/orders">Orders</Link></li>
    </ul>
  </aside>
);
export default Sidebar;
