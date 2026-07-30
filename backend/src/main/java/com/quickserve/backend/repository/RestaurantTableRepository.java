package com.quickserve.backend.repository;

import com.quickserve.backend.entity.RestaurantTable;
import com.quickserve.backend.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    boolean existsByTableNumber(Integer tableNumber);

    boolean existsByQrCode(String qrCode);

    Optional<RestaurantTable> findByQrCode(String qrCode);

    List<RestaurantTable> findByStatus(TableStatus status);

    List<RestaurantTable> findByActiveTrue();
}
