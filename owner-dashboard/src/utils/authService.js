const TOKEN_KEY = 'quickserve_token';

/**
 * Safely parse a JWT string to extract its payload.
 * Returns null if token is missing, not a string, or improperly formatted.
 */
export const parseJwt = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Checks if the current stored token is valid, unexpired, and belongs to an OWNER.
 * Cleans up invalid/expired tokens and returns false if invalid.
 */
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;

  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    removeToken();
    return false;
  }

  // Verify expiration (exp is in seconds)
  if (payload.exp * 1000 <= Date.now()) {
    removeToken();
    return false;
  }

  // Verify role is OWNER
  if (payload.role !== 'OWNER') {
    removeToken();
    return false;
  }

  return true;
};

