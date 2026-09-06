package com.quickserve.backend.repository;

import com.quickserve.backend.entity.RestaurantTable;
import com.quickserve.backend.entity.SessionStatus;
import com.quickserve.backend.entity.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableSessionRepository extends JpaRepository<TableSession, Long> {

    Optional<TableSession> findBySessionToken(String sessionToken);

    Optional<TableSession> findByRestaurantTableAndStatus(RestaurantTable restaurantTable, SessionStatus status);

    Optional<TableSession> findByTableNumberAndStatus(Integer tableNumber, SessionStatus status);

    boolean existsByRestaurantTableAndStatus(RestaurantTable restaurantTable, SessionStatus status);

    boolean existsByTableNumberAndStatus(Integer tableNumber, SessionStatus status);

    List<TableSession> findByStatus(SessionStatus status);
}
