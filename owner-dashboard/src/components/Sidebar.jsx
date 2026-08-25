import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/authService';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/orders">Orders</Link></li>
        <li><button onClick={handleLogout} style={styles.logoutBtn}>Logout</button></li>
      </ul>
    </aside>
  );
};

const styles = {
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit'
  }
};
export default Sidebar;
