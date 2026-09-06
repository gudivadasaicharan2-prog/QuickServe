package com.quickserve.backend.repository;

import com.quickserve.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findTop50ByOrderByCreatedAtDesc();

    long countByReadStatusFalse();

    @Modifying
    @Query("UPDATE Notification n SET n.readStatus = true WHERE n.readStatus = false")
    void markAllAsRead();
}
