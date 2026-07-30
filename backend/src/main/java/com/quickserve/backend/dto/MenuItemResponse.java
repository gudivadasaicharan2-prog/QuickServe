package com.quickserve.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private boolean available;

    /** Inlined category info — avoids a separate API call for category details. */
    private Long categoryId;
    private String categoryName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
