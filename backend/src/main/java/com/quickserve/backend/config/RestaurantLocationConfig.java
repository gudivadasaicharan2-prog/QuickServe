package com.quickserve.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Holds the physical location of the restaurant and the maximum radius (metres)
 * within which a customer is allowed to place a QR-based order.
 *
 * <p>Values are read from {@code application.properties}:
 * <pre>
 *   restaurant.location.latitude=16.5062
 *   restaurant.location.longitude=80.6480
 *   restaurant.location.radius-meters=100
 * </pre>
 */
@Configuration
@Getter
public class RestaurantLocationConfig {

    /** Latitude of the restaurant in decimal degrees. */
    @Value("${restaurant.location.latitude}")
    private double latitude;

    /** Longitude of the restaurant in decimal degrees. */
    @Value("${restaurant.location.longitude}")
    private double longitude;

    /** Maximum allowed distance (in metres) for a customer to place an order. */
    @Value("${restaurant.location.radius-meters}")
    private double radiusMeters;
}
