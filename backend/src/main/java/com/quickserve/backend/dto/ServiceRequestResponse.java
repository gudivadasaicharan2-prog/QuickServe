package com.quickserve.backend.dto;

import com.quickserve.backend.entity.RequestStatus;
import com.quickserve.backend.entity.RequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestResponse {

    private Long id;
    private String tableNumber;
    private RequestType requestType;
    private RequestStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
