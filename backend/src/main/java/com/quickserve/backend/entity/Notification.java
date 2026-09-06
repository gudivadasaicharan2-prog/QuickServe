package com.quickserve.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String message;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "table_number", length = 20)
    private String tableNumber;

    @Column(name = "read_status", nullable = false)
    @Builder.Default
    private boolean readStatus = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
