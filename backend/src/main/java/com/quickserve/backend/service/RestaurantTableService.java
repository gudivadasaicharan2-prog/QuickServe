package com.quickserve.backend.service;

import com.quickserve.backend.dto.RestaurantTableRequest;
import com.quickserve.backend.dto.RestaurantTableResponse;
import com.quickserve.backend.entity.TableStatus;

import java.util.List;

public interface RestaurantTableService {

    /**
     * Creates a new restaurant table.
     * @throws com.quickserve.backend.exception.DuplicateResourceException if tableNumber or qrCode already exists
     */
    RestaurantTableResponse createTable(RestaurantTableRequest request);

    /**
     * Returns all restaurant tables.
     */
    List<RestaurantTableResponse> getAllTables();

    /**
     * Returns a specific table by ID.
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    RestaurantTableResponse getTableById(Long id);

    /**
     * Returns a specific table by QR code.
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    RestaurantTableResponse getTableByQrCode(String qrCode);

    /**
     * Returns all tables matching the given status.
     */
    List<RestaurantTableResponse> getTablesByStatus(TableStatus status);

    /**
     * Updates an existing table.
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     * @throws com.quickserve.backend.exception.DuplicateResourceException if tableNumber or qrCode conflicts
     */
    RestaurantTableResponse updateTable(Long id, RestaurantTableRequest request);

    /**
     * Deletes a table permanently.
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    void deleteTable(Long id);

    /**
     * Marks a table as active.
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    RestaurantTableResponse activateTable(Long id);

    /**
     * Marks a table as inactive.
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    RestaurantTableResponse deactivateTable(Long id);
}
