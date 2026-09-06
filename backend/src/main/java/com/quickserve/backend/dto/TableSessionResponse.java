package com.quickserve.backend.dto;

import com.quickserve.backend.entity.SessionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableSessionResponse {

    private String sessionToken;
    private Integer tableNumber;
    private SessionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
