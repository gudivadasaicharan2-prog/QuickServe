package com.quickserve.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for {@code POST /api/location/validate}.
 *
 * <p>Example (inside radius):
 * <pre>
 * {
 *   "withinRadius": true,
 *   "distance": 42.5,
 *   "message": "Ordering allowed"
 * }
 * </pre>
 *
 * <p>Example (outside radius):
 * <pre>
 * {
 *   "withinRadius": false,
 *   "distance": 245.3,
 *   "message": "You must be inside the restaurant to place an order."
 * }
 * </pre>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationValidationResponse {

    /** {@code true} if the customer is within the allowed ordering radius. */
    private boolean withinRadius;

    /**
     * Straight-line distance in metres between the customer's location and the
     * restaurant, rounded to one decimal place.
     */
    private double distance;

    /** Human-readable message indicating whether ordering is permitted. */
    private String message;
}
