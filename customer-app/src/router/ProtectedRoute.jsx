import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  if (isLoggedIn()) {
    return children;
  }
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
