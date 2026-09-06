import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, ClipboardList, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './BottomNav.css';

const BottomNav = () => {
  const { totalItems } = useCart();

  return (
    <nav className="bottom-nav" aria-label="Customer Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
        }
      >
        <UtensilsCrossed size={20} strokeWidth={1.75} />
        <span>Menu</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
        }
      >
        <div className="bottom-nav__icon-wrap">
          <ShoppingBag size={20} strokeWidth={1.75} />
          {totalItems > 0 && (
            <span className="bottom-nav__badge">{totalItems}</span>
          )}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
        }
      >
        <ClipboardList size={20} strokeWidth={1.75} />
        <span>Orders</span>
      </NavLink>

      <NavLink
        to="/requests"
        className={({ isActive }) =>
          `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
        }
      >
        <Bell size={20} strokeWidth={1.75} />
        <span>Assistance</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
