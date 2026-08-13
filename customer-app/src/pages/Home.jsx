import React from 'react';
import Menu from './Menu';

/**
 * Home
 *
 * The landing page of the customer app.
 * Renders the Menu component, which fetches live menu data from the backend
 * (GET /api/menu) and displays each item via FoodCard — including the
 * preparationTime field returned by the API.
 *
 * Mock data (utils/mockData.js) is no longer used here.
 */
const Home = () => <Menu />;

export default Home;
