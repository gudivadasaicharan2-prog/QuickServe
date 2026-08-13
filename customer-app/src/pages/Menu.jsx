import React, { useEffect, useState } from 'react';
import FoodCard from '../components/FoodCard';
import { fetchMenuItems } from '../services/menuService';
import './Menu.css';

/**
 * Menu
 *
 * Fetches all menu items from the real backend API (GET /api/menu)
 * and renders them as a responsive grid of FoodCard components.
 *
 * preparationTime is read directly from the API response and passed
 * to FoodCard — it is NEVER hardcoded here or in FoodCard.
 *
 * States handled:
 *   • loading  — spinner while the fetch is in progress
 *   • error    — user-friendly message if the request fails
 *   • empty    — message when the API returns an empty array
 *   • success  — grid of FoodCard components
 */
const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchMenuItems();
        if (!cancelled) {
          setMenuItems(items);
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

    // Cleanup: ignore response if the component unmounts mid-fetch
    return () => { cancelled = true; };
  }, []);

  /* ── Loading ───────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <section className="menu-page">
        <h1 className="menu-page__heading">Our Menu</h1>
        <div className="menu-page__state" aria-live="polite" aria-label="Loading menu">
          <div className="menu-page__spinner" role="status" />
          <span>Loading menu…</span>
        </div>
      </section>
    );
  }

  /* ── Error ─────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <section className="menu-page">
        <h1 className="menu-page__heading">Our Menu</h1>
        <div className="menu-page__state menu-page__state--error" role="alert">
          <span className="menu-page__state-icon">⚠️</span>
          <span>{error}</span>
          <small>Make sure the backend server is running on port 8080.</small>
        </div>
      </section>
    );
  }

  /* ── Empty ─────────────────────────────────────────────────────────── */
  if (menuItems.length === 0) {
    return (
      <section className="menu-page">
        <h1 className="menu-page__heading">Our Menu</h1>
        <div className="menu-page__state">
          <span className="menu-page__state-icon">🍽️</span>
          <span>No menu items available yet.</span>
        </div>
      </section>
    );
  }

  /* ── Success ───────────────────────────────────────────────────────── */
  return (
    <section className="menu-page">
      <h1 className="menu-page__heading">Our Menu</h1>
      <p className="menu-page__subtitle">
        {menuItems.length} item{menuItems.length !== 1 ? 's' : ''} available
      </p>

      <div className="menu-page__grid" role="list">
        {menuItems.map((item) => (
          <div key={item.id} role="listitem">
            <FoodCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Menu;
