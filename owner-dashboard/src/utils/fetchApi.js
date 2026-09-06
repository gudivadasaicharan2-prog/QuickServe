import { getToken, removeToken } from './authService';

const BASE_URL = 'http://localhost:8080';

/**
 * Authenticated API fetch wrapper.
 * @param {string} endpoint - Path starting with /
 * @param {{ method?: string, body?: object }} [options] - Optional method (default GET) and body.
 */
const fetchApi = async (endpoint, options = {}) => {
  const token = getToken();

  if (!token) {
    removeToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(`Authentication required (${endpoint})`);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(`API error: ${response.status} ${response.statusText} (${endpoint})`);
  }

  // 204 No Content — return null
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export default fetchApi;

