package com.quickserve.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private String tableNumber;
    private boolean readStatus;
    private LocalDateTime createdAt;
}
