import API_URL from './api';

/**
 * Creates a new service request (e.g. CALL_WAITER, REQUEST_BILL, WATER, CUTLERY, TISSUE)
 * @param {{ tableNumber: string, requestType: string, notes?: string }} payload
 */
export async function createServiceRequest(payload) {
  const response = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Request failed (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Fetches all service requests.
 */
export async function fetchServiceRequests() {
  const response = await fetch(`${API_URL}/requests`);
  if (!response.ok) {
    throw new Error(`Failed to load requests (HTTP ${response.status})`);
  }
  return response.json();
}
