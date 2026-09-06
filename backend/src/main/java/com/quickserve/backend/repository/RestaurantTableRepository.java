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

    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT t FROM RestaurantTable t WHERE t.tableNumber = :tableNumber")
    Optional<RestaurantTable> findByTableNumberForUpdate(@org.springframework.data.repository.query.Param("tableNumber") Integer tableNumber);

    boolean existsByQrCode(String qrCode);

    Optional<RestaurantTable> findByQrCode(String qrCode);

    List<RestaurantTable> findByStatus(TableStatus status);

    List<RestaurantTable> findByActiveTrue();
}
