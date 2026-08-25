const BASE_URL = 'http://localhost:8080';

// Token key matches the project-wide storage convention in customer-app/src/services/authService.js
const TOKEN_KEY = 'quickserve_token';

/**
 * Authenticated API fetch wrapper.
 * @param {string} endpoint - Path starting with /
 * @param {{ method?: string, body?: object }} [options] - Optional method (default GET) and body.
 */
const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText} (${endpoint})`);
  }

  // 204 No Content — return null
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export default fetchApi;

