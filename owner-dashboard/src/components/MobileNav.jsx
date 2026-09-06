import { useState } from 'react';
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
  Menu,
  X,
  ChefHat,
} from 'lucide-react';
import { removeToken } from '../utils/authService';
import { useTheme } from '../context/ThemeContext';
import './MobileNav.css';

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tables',     label: 'Tables',    icon: TableProperties  },
  { to: '/categories', label: 'Categories',icon: Tag              },
  { to: '/menu',       label: 'Menu',      icon: UtensilsCrossed  },
  { to: '/orders',     label: 'Orders',    icon: ClipboardList    },
  { to: '/requests',   label: 'Requests',  icon: Bell             },
];

const MobileNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile top header */}
      <header className="mobile-header">
        <div className="mobile-header__logo">
          <div className="mobile-header__logo-icon">
            <ChefHat size={16} strokeWidth={2.5} />
          </div>
          <span>QuickServe</span>
        </div>
        <div className="mobile-header__actions">
          <button
            className="btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            className="btn-icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer__header">
              <div className="mobile-header__logo">
                <div className="mobile-header__logo-icon">
                  <ChefHat size={16} strokeWidth={2.5} />
                </div>
                <span>QuickServe</span>
              </div>
              <button className="btn-icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-drawer__nav">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `mobile-drawer__link${isActive ? ' mobile-drawer__link--active' : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mobile-drawer__footer">
              <button className="mobile-drawer__theme-btn" onClick={() => { toggleTheme(); setMenuOpen(false); }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button className="mobile-drawer__logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
