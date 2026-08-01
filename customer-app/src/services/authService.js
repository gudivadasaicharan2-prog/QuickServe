const TOKEN_KEY = "quickserve_token";

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};
