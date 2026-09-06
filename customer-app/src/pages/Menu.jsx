import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { fetchMenuItems, fetchCategories } from '../services/menuService';
import { useCart } from '../context/CartContext';
import { Search, ArrowRight, ShoppingBag, UtensilsCrossed, AlertCircle } from 'lucide-react';
import './Menu.css';

/**
 * Menu Page
 *
 * Sourced directly from GET /api/menu and GET /api/categories.
 * Features:
 * - Horizontally scrollable category pills
 * - Live search filter
 * - Grid / list of FoodCard components
 * - Floating sticky cart bar on mobile when items are present
 * - Loading, error, and empty states
 */
const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { totalItems, cartTotal } = useCart();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [items, cats] = await Promise.all([
          fetchMenuItems(),
          fetchCategories().catch(() => []),
        ]);
        if (!cancelled) {
          setMenuItems(items);
          setCategories(cats);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load the menu. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        item.categoryId === selectedCategory ||
        item.categoryName?.toUpperCase() === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="menu-screen">
      {/* Search Input */}
      <div className="menu-search-wrap">
        <Search size={16} className="menu-search-icon" />
        <input
          type="search"
          className="menu-search-input"
          placeholder="Search food, beverages, desserts…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search menu items"
        />
        {searchQuery && (
          <button
            className="menu-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="category-scroll-container" role="tablist" aria-label="Menu categories">
        <button
          className={`category-pill${selectedCategory === 'ALL' ? ' active' : ''}`}
          onClick={() => setSelectedCategory('ALL')}
          role="tab"
          aria-selected={selectedCategory === 'ALL'}
        >
          ALL
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill${
              selectedCategory === cat.id || selectedCategory === cat.name?.toUpperCase()
                ? ' active'
                : ''
            }`}
            onClick={() => setSelectedCategory(cat.id)}
            role="tab"
            aria-selected={selectedCategory === cat.id}
          >
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="state-container" aria-live="polite">
          <div className="spinner" role="status" />
          <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
            Loading delicious menu…
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="state-container" role="alert">
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Make sure the backend is running on port 8080.
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredItems.length === 0 ? (
            <div className="state-container card" style={{ marginTop: '1rem' }}>
              <UtensilsCrossed size={32} strokeWidth={1.25} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                No dishes found
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'No items available in this category yet.'}
              </span>
            </div>
          ) : (
            <div className="menu-list" role="list">
              {filteredItems.map((item) => (
                <div key={item.id} role="listitem">
                  <FoodCard item={item} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating Sticky Cart Bar */}
      {totalItems > 0 && (
        <Link to="/cart" className="floating-cart-bar" aria-label="View Cart">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={15} />
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
              <span style={{ margin: '0 0.35rem', opacity: 0.5 }}>•</span>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.875rem' }}>
            <span>View Cart</span>
            <ArrowRight size={16} />
          </div>
        </Link>
      )}
    </div>
  );
};

export default Menu;
