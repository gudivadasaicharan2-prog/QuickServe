import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('qs_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [cookingInstructions, setCookingInstructions] = useState(() => {
    return localStorage.getItem('qs_cooking_instructions') || '';
  });

  const [tableNumber, setTableNumber] = useState(() => {
    // Check URL search param first (e.g. ?table=12)
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      localStorage.setItem('qs_table', tableParam);
      return tableParam;
    }
    return localStorage.getItem('qs_table') || '1';
  });

  useEffect(() => {
    localStorage.setItem('qs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('qs_cooking_instructions', cookingInstructions);
  }, [cookingInstructions]);

  useEffect(() => {
    localStorage.setItem('qs_table', tableNumber);
  }, [tableNumber]);

  /**
   * Adds an item to the cart or increments its quantity.
   */
  const addToCart = (product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === product.id);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /**
   * Removes an item completely from the cart.
   */
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  /**
   * Updates the quantity of an item in the cart.
   * If quantity <= 0, the item is removed.
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Clears all items and instructions from the cart.
   */
  const clearCart = () => {
    setCart([]);
    setCookingInstructions('');
  };

  /**
   * Returns current quantity for a specific item in the cart.
   */
  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity || 1 : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        cookingInstructions,
        setCookingInstructions,
        tableNumber,
        setTableNumber,
        totalItems,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
