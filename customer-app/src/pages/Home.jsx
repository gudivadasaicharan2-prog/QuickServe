import React from 'react';
import { products } from '../utils/mockData';
import { useCart } from '../context/CartContext';
import PrimaryButton from '../components/PrimaryButton';
const Home = () => {
  const { addToCart } = useCart();
  return (
    <div>
      <h1>Home Page</h1>
      {products.map(p => (
        <div key={p.id}>
          {p.name} - ${p.price} 
          <PrimaryButton onClick={() => addToCart(p)}>Add to Cart</PrimaryButton>
        </div>
      ))}
    </div>
  );
};
export default Home;
