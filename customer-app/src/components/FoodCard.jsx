import React from 'react';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

/**
 * FoodCard
 *
 * Displays a single menu item returned by GET /api/menu.
 *
 * Props:
 *   item {object} — menu item from the backend, containing at minimum:
 *     id, name, description, price, imageUrl, available,
 *     preparationTime (nullable Integer), categoryName
 *
 * preparationTime is sourced directly from the backend response.
 * It is NEVER hardcoded here — if the backend returns null, the badge
 * is simply not rendered (graceful degradation).
 */
const FoodCard = ({ item }) => {
  const { addToCart } = useCart();

  const {
    name,
    description,
    price,
    imageUrl,
    available,
    preparationTime,   // Nullable Integer from backend — do NOT hardcode
    categoryName,
  } = item;

  return (
    <article
      className={`food-card${!available ? ' food-card--unavailable' : ''}`}
      aria-label={name}
    >
      {/* ── Item image ──────────────────────────────────────────────── */}
      {imageUrl ? (
        <img
          className="food-card__image"
          src={imageUrl}
          alt={name}
          loading="lazy"
        />
      ) : (
        <div className="food-card__image-placeholder" aria-hidden="true">
          🍽️
        </div>
      )}

      {/* ── Card body ───────────────────────────────────────────────── */}
      <div className="food-card__body">

        {/* Category label */}
        {categoryName && (
          <p className="food-card__category">{categoryName}</p>
        )}

        {/* Item name */}
        <h2 className="food-card__name">{name}</h2>

        {/* Description */}
        {description && (
          <p className="food-card__description">{description}</p>
        )}

        {/* Unavailable badge */}
        {!available && (
          <span className="food-card__unavailable-badge">Unavailable</span>
        )}

        {/* ── Price + Preparation time ───────────────────────────────── */}
        <div className="food-card__meta">
          <span className="food-card__price">₹{Number(price).toFixed(2)}</span>

          {/*
           * Preparation time badge.
           * Only rendered when the backend actually provides a value.
           * preparationTime === null or undefined → badge is hidden.
           */}
          {preparationTime != null && (
            <span
              className="food-card__prep-time"
              title="Estimated preparation time"
              aria-label={`Preparation time: ${preparationTime} minutes`}
            >
              <span className="food-card__prep-time-icon" aria-hidden="true">⏱</span>
              {preparationTime} min
            </span>
          )}
        </div>

        {/* ── Add to cart ─────────────────────────────────────────────── */}
        {available && (
          <button
            id={`add-to-cart-${item.id}`}
            className="food-card__add-btn"
            onClick={() => addToCart(item)}
            aria-label={`Add ${name} to cart`}
          >
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
};

export default FoodCard;
