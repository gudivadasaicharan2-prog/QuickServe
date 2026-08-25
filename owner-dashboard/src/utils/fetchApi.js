const BASE_URL = 'http://localhost:8080';

// Token key matches the project-wide storage convention in customer-app/src/services/authService.js
const TOKEN_KEY = 'quickserve_token';

const fetchApi = async (endpoint) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText} (${endpoint})`);
  }

  return response.json();
};

export default fetchApi;
