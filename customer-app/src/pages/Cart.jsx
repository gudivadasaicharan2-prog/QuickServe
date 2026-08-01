import React from 'react';
import { useCart } from '../context/CartContext';
const Cart = () => {
  const { cart } = useCart();
  return (
    <div>
      <h1>Cart</h1>
      <ul>{cart.map((item, i) => <li key={i}>{item.name} - ${item.price}</li>)}</ul>
    </div>
  );
};
export default Cart;
