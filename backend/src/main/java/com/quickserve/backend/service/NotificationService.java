package com.quickserve.backend.service;

import com.quickserve.backend.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    void createNotification(String title, String message, String type, Long referenceId, String tableNumber);

    List<NotificationResponse> getRecentNotifications();

    long getUnreadCount();

    NotificationResponse markAsRead(Long id);

    void markAllAsRead();
}
