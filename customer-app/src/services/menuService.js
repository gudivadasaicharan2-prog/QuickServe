/**
 * menuService.js
 *
 * Provides functions to call the QuickServe backend menu, category, and table endpoints.
 * All calls target the base URL configured in VITE_API_URL (.env).
 */

import API_URL from './api';

/**
 * Fetches all menu items from GET /api/menu.
 */
export async function fetchMenuItems() {
  const response = await fetch(`${API_URL}/menu`);
  if (!response.ok) {
    throw new Error(`Failed to load menu (HTTP ${response.status})`);
  }
  return response.json();
}

/**
 * Fetches all categories from GET /api/categories.
 */
export async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error(`Failed to load categories (HTTP ${response.status})`);
  }
  return response.json();
}

/**
 * Fetches all tables from GET /api/tables.
 */
export async function fetchTables() {
  const response = await fetch(`${API_URL}/tables`);
  if (!response.ok) {
    throw new Error(`Failed to load tables (HTTP ${response.status})`);
  }
  return response.json();
}
