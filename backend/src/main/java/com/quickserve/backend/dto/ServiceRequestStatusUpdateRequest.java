package com.quickserve.backend.dto;

import com.quickserve.backend.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceRequestStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RequestStatus status;
}
