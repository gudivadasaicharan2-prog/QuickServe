package com.quickserve.backend.controller;

import com.quickserve.backend.config.RestaurantLocationConfig;
import com.quickserve.backend.dto.LocationValidationRequest;
import com.quickserve.backend.dto.LocationValidationResponse;
import com.quickserve.backend.util.HaversineUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for customer location validation.
 *
 * <p>Exposes a single public endpoint used by the QR-based ordering flow to
 * verify that a customer is physically inside the restaurant before allowing
 * them to place an order.
 *
 * <p>The distance calculation is delegated to {@link HaversineUtil}; this
 * controller contains no mathematical logic.
 */
@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final RestaurantLocationConfig locationConfig;

    /**
     * POST /api/location/validate
     *
     * <p>Validates whether the customer's GPS coordinates are within the
     * configured ordering radius of the restaurant.
     *
     * <p>This endpoint is intentionally public (no authentication required)
     * so that it can be called before the customer has logged in.
     *
     * @param request the customer's current latitude and longitude
     * @return a {@link LocationValidationResponse} indicating whether ordering
     *         is permitted, the computed distance in metres, and a human-readable message
     */
    @PostMapping("/validate")
    public ResponseEntity<LocationValidationResponse> validateLocation(
            @Valid @RequestBody LocationValidationRequest request) {

        double distance = HaversineUtil.distanceMeters(
                locationConfig.getLatitude(),
                locationConfig.getLongitude(),
                request.getLatitude(),
                request.getLongitude()
        );

        boolean withinRadius = distance <= locationConfig.getRadiusMeters();

        String message = withinRadius
                ? "Ordering allowed"
                : "You must be inside the restaurant to place an order.";

        LocationValidationResponse response = LocationValidationResponse.builder()
                .withinRadius(withinRadius)
                .distance(distance)
                .message(message)
                .build();

        return ResponseEntity.ok(response);
    }
}
