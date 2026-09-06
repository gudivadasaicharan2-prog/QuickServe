package com.quickserve.backend.service.impl;

import com.quickserve.backend.dto.NotificationResponse;
import com.quickserve.backend.entity.Notification;
import com.quickserve.backend.exception.ResourceNotFoundException;
import com.quickserve.backend.repository.NotificationRepository;
import com.quickserve.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(String title, String message, String type, Long referenceId, String tableNumber) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .tableNumber(tableNumber)
                .readStatus(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("[Notification] Created #{} - {} for Table {}", saved.getId(), title, tableNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentNotifications() {
        return notificationRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByReadStatusFalse();
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));

        notification.setReadStatus(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .tableNumber(notification.getTableNumber())
                .readStatus(notification.isReadStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
