/**
 * menuService.js
 *
 * Provides functions to call the QuickServe backend menu endpoints.
 * All calls target the base URL configured in VITE_API_URL (.env).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Fetches all menu items from GET /api/menu.
 *
 * @returns {Promise<Array>} Array of menu item objects, each including
 *   id, name, description, price, imageUrl, available, preparationTime,
 *   categoryId, categoryName, createdAt, updatedAt.
 * @throws {Error} If the HTTP response is not OK.
 */
export async function fetchMenuItems() {
  const response = await fetch(`${API_URL}/menu`);
  if (!response.ok) {
    throw new Error(`Failed to load menu (HTTP ${response.status})`);
  }
  return response.json();
}
