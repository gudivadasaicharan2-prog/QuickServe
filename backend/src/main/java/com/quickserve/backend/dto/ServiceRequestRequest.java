package com.quickserve.backend.dto;

import com.quickserve.backend.entity.RequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ServiceRequestRequest {

    @NotBlank(message = "Table number is required")
    @Size(max = 20, message = "Table number must not exceed 20 characters")
    private String tableNumber;

    @NotNull(message = "Request type is required")
    private RequestType requestType;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
