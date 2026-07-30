package com.quickserve.backend.dto;

import com.quickserve.backend.entity.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTableResponse {

    private Long id;
    private Integer tableNumber;
    private Integer capacity;
    private String qrCode;
    private TableStatus status;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
