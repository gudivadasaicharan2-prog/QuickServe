import API_URL from './api';

/**
 * Places an order with the backend.
 * @param {{ tableNumber: string, specialInstructions?: string, items: Array<{ menuItemId: number, quantity: number }> }} payload
 */
export async function placeOrder(payload) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Order failed (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Fetches all orders.
 */
export async function fetchOrders() {
  const response = await fetch(`${API_URL}/orders`);
  if (!response.ok) {
    throw new Error(`Failed to load orders (HTTP ${response.status})`);
  }
  return response.json();
}
