import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TableProperties,
  Tag,
  UtensilsCrossed,
  ClipboardList,
  Bell,
  LogOut,
  Sun,
  Moon,
  ChefHat,
} from 'lucide-react';
import { removeToken } from '../utils/authService';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tables',     label: 'Tables',    icon: TableProperties  },
  { to: '/categories', label: 'Categories',icon: Tag              },
  { to: '/menu',       label: 'Menu',      icon: UtensilsCrossed  },
  { to: '/orders',     label: 'Orders',    icon: ClipboardList    },
  { to: '/requests',   label: 'Requests',  icon: Bell             },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    removeToken();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <ChefHat size={20} strokeWidth={2.5} />
        </div>
        <span className="sidebar__logo-text">QuickServe</span>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        <ul className="sidebar__nav-list">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom controls */}
      <div className="sidebar__footer">
        <button
          className="sidebar__theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button
          className="sidebar__logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
