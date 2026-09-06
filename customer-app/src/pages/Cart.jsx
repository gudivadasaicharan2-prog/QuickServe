import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/orderService';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  UtensilsCrossed,
} from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cookingInstructions,
    setCookingInstructions,
    tableNumber,
    cartTotal,
    totalItems,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        tableNumber: String(tableNumber || '1'),
        specialInstructions: cookingInstructions.trim() || undefined,
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      const result = await placeOrder(payload);
      setPlacedOrder(result);
      clearCart();
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Placed Order Success Screen ──────────────────────────────── */
  if (placedOrder) {
    return (
      <div className="cart-success-screen card">
        <div className="cart-success-icon">
          <CheckCircle2 size={48} strokeWidth={1.75} />
        </div>
        <h2 className="cart-success-title">Order Placed!</h2>
        <p className="cart-success-subtitle">
          Your order has been sent to the kitchen.
        </p>

        <div className="cart-order-summary">
          <div className="cart-order-row">
            <span>Order Number</span>
            <strong>#{placedOrder.orderNumber || placedOrder.id}</strong>
          </div>
          <div className="cart-order-row">
            <span>Table</span>
            <strong>Table {placedOrder.tableNumber || tableNumber}</strong>
          </div>
          <div className="cart-order-row">
            <span>Total Amount</span>
            <strong>₹{Number(placedOrder.totalAmount || 0).toFixed(2)}</strong>
          </div>
          <div className="cart-order-row">
            <span>Status</span>
            <span className="cart-status-chip">{placedOrder.status || 'PENDING'}</span>
          </div>
        </div>

        <div className="cart-success-actions">
          <button
            className="btn btn-primary w-full"
            onClick={() => navigate('/orders')}
          >
            View Orders
          </button>
          <button
            className="btn btn-secondary w-full"
            onClick={() => {
              setPlacedOrder(null);
              navigate('/');
            }}
          >
            Order More Items
          </button>
        </div>
      </div>
    );
  }

  /* ── Empty Cart Screen ────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="state-container card" style={{ marginTop: '1.5rem', padding: '3.5rem 1.5rem' }}>
        <ShoppingBag size={48} strokeWidth={1.25} style={{ opacity: 0.3 }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>
          Your cart is empty
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 280, margin: '0 auto' }}>
          Explore our menu and add your favorite dishes to get started.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <UtensilsCrossed size={16} />
          <span>Browse Menu</span>
        </Link>
      </div>
    );
  }

  /* ── Main Cart View ───────────────────────────────────────────── */
  return (
    <div className="cart-screen">
      <div className="cart-header">
        <Link to="/" className="cart-back-btn" aria-label="Back to menu">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="cart-title">Your Order</h1>
        <div className="cart-table-tag">
          Table <strong>{tableNumber}</strong>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Items List */}
      <div className="cart-items-list card">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item__info">
              <h3 className="cart-item__name">{item.name}</h3>
              <span className="cart-item__unit-price">
                ₹{Number(item.price).toFixed(2)} each
              </span>
            </div>

            <div className="cart-item__actions">
              <div className="qty-control" role="group" aria-label={`Quantity for ${item.name}`}>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-display">{item.quantity || 1}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="cart-item__subtotal">
                ₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}
              </div>

              <button
                className="cart-item__remove"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cooking Instructions */}
      <div className="cart-section card card-body" style={{ marginTop: '0.875rem' }}>
        <label className="form-label" htmlFor="cooking-instructions">
          Cooking Instructions / Notes (Optional)
        </label>
        <textarea
          id="cooking-instructions"
          className="form-textarea"
          rows={2}
          maxLength={500}
          placeholder="e.g. Less spicy, no onions, extra napkins…"
          value={cookingInstructions}
          onChange={(e) => setCookingInstructions(e.target.value)}
        />
      </div>

      {/* Bill Summary */}
      <div className="cart-section card card-body" style={{ marginTop: '0.875rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Bill Summary
        </h3>
        <div className="cart-bill-row">
          <span>Items Total ({totalItems})</span>
          <span>₹{cartTotal.toFixed(2)}</span>
        </div>
        <div className="cart-bill-row">
          <span>Taxes & Service</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Included</span>
        </div>
        <div className="cart-bill-row cart-bill-total">
          <span>Total Payable at Counter</span>
          <strong>₹{cartTotal.toFixed(2)}</strong>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="cart-checkout-wrap">
        <button
          className="btn btn-primary cart-place-btn"
          onClick={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18 }} />
              <span>Placing Order…</span>
            </>
          ) : (
            <>
              <span>Place Order for Table {tableNumber}</span>
              <span className="cart-place-total">• ₹{cartTotal.toFixed(2)}</span>
            </>
          )}
        </button>
        <p className="cart-payment-note">
          Pay at counter or upon bill request • No online payment required
        </p>
      </div>
    </div>
  );
};

export default Cart;
