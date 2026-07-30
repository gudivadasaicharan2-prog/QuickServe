package com.quickserve.backend.dto;

import com.quickserve.backend.entity.TableStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RestaurantTableRequest {

    @NotNull(message = "Table number is required")
    private Integer tableNumber;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than zero")
    private Integer capacity;

    @NotBlank(message = "QR code is required")
    @Size(max = 500, message = "QR code must not exceed 500 characters")
    private String qrCode;

    private TableStatus status;

    private Boolean active;
}
