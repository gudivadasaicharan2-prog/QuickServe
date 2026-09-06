import { useCart } from '../context/CartContext';
import { Clock, Plus, Minus } from 'lucide-react';
import './FoodCard.css';

/**
 * FoodCard
 *
 * Displays a single menu item returned by GET /api/menu.
 * - Sourced directly from backend response
 * - Images only rendered if real `imageUrl` is provided (no fake food images)
 * - Dynamic quantity controls (− 1 +) once added
 * - Preserves item id on buttons for testability
 */
const FoodCard = ({ item }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  const {
    id,
    name,
    description,
    price,
    imageUrl,
    available = true,
    preparationTime,
    categoryName,
  } = item;

  const quantity = getItemQuantity(id);

  return (
    <article
      className={`food-card${!available ? ' food-card--unavailable' : ''}`}
      aria-label={name}
    >
      <div className="food-card__content">
        {/* Category & Prep Time */}
        <div className="food-card__top-meta">
          {categoryName && (
            <span className="food-card__category">{categoryName}</span>
          )}
          {preparationTime != null && (
            <span
              className="food-card__prep-time"
              title="Estimated preparation time"
              aria-label={`Preparation time: ${preparationTime} minutes`}
            >
              <Clock size={12} />
              {preparationTime} min
            </span>
          )}
        </div>

        {/* Item Name */}
        <h3 className="food-card__name">{name}</h3>

        {/* Description (if available) */}
        {description && (
          <p className="food-card__description">{description}</p>
        )}

        {/* Footer: Price + Add / Quantity Controls */}
        <div className="food-card__footer">
          <div className="food-card__price-wrap">
            <span className="food-card__price">₹{Number(price).toFixed(2)}</span>
            {!available && (
              <span className="food-card__unavailable-tag">Unavailable</span>
            )}
          </div>

          <div className="food-card__action">
            {!available ? (
              <span className="food-card__sold-out">Sold out</span>
            ) : quantity > 0 ? (
              <div className="qty-control" role="group" aria-label={`Quantity for ${name}`}>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(id, quantity - 1)}
                  aria-label={`Decrease quantity of ${name}`}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(id, quantity + 1)}
                  aria-label={`Increase quantity of ${name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                id={`add-to-cart-${id}`}
                className="food-card__add-btn"
                onClick={() => addToCart(item)}
                aria-label={`Add ${name} to cart`}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real Image ONLY if present (NO placeholders) */}
      {imageUrl && (
        <div className="food-card__media">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="food-card__img"
            onError={(e) => {
              // Hide image container if it fails to load
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </article>
  );
};

export default FoodCard;
