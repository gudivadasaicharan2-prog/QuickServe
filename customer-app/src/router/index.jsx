import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import Requests from '../pages/Requests';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/cart', element: <Cart /> },
      { path: '/orders', element: <Orders /> },
      { path: '/requests', element: <Requests /> },
    ],
  },
]);

export default router;
