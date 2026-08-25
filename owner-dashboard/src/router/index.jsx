import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <DashboardLayout />,
            children: [
              { path: "/", element: <Dashboard /> },
              { path: "/orders", element: <Orders /> }
            ]
          }
        ]
      }
    ]
  }
]);
export default router;
