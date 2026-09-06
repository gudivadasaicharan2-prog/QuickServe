import API_URL from './api';

/**
 * Validates GPS coordinates against the restaurant's configured radius.
 */
export async function validateLocation(latitude, longitude) {
  const response = await fetch(`${API_URL}/location/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Location check failed (HTTP ${response.status})`);
  }
  return response.json();
}

/**
 * Fetches all tables with their current occupancy status from public endpoint.
 */
export async function fetchPublicTables() {
  const response = await fetch(`${API_URL}/tables/public`);
  if (!response.ok) {
    throw new Error(`Failed to load tables (HTTP ${response.status})`);
  }
  return response.json();
}

/**
 * Atomically claims a table on the backend, enforcing location check.
 */
export async function claimTable({ tableNumber, latitude, longitude }) {
  const response = await fetch(`${API_URL}/sessions/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableNumber: Number(tableNumber),
      latitude,
      longitude,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to claim table (HTTP ${response.status})`);
  }
  return data;
}

/**
 * Retrieves the details and status of an existing session token.
 */
export async function fetchSession(sessionToken) {
  if (!sessionToken) return null;
  const response = await fetch(`${API_URL}/sessions/${sessionToken}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Session check failed (HTTP ${response.status})`);
  }
  return response.json();
}

/**
 * Explicitly closes a customer table session.
 */
export async function closeSession(sessionToken) {
  if (!sessionToken) return;
  const response = await fetch(`${API_URL}/sessions/${sessionToken}/close`, {
    method: 'POST',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Failed to close session (HTTP ${response.status})`);
  }
  return response.json();
}
