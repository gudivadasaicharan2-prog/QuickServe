import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Requests from '../pages/Requests';
import Menu from '../pages/Menu';
import Categories from '../pages/Categories';
import Tables from '../pages/Tables';
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
              { path: "/tables", element: <Tables /> },
              { path: "/categories", element: <Categories /> },
              { path: "/menu", element: <Menu /> },
              { path: "/orders", element: <Orders /> },
              { path: "/requests", element: <Requests /> }
            ]
          }
        ]
      }
    ]
  }
]);
export default router;
