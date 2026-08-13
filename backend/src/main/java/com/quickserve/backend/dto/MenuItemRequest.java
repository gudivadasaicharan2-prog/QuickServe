package com.quickserve.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuItemRequest {

    @NotBlank(message = "Menu item name must not be blank")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 integer digits and 2 decimal places")
    private BigDecimal price;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    /**
     * Whether the item is currently available.
     * Null is treated as true (available) by the service layer.
     * Use PATCH /api/menu/{id}/availability to toggle after creation.
     */
    private Boolean available;

    /**
     * Estimated preparation time in minutes.
     * Optional — if not supplied the field is persisted as {@code null}.
     * Must be a positive integer when provided (e.g. Coffee → 5, Biryani → 30).
     */
    @jakarta.validation.constraints.Min(value = 1, message = "Preparation time must be at least 1 minute")
    private Integer preparationTime;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
