package com.quickserve.backend.controller;

import com.quickserve.backend.dto.RestaurantTableRequest;
import com.quickserve.backend.dto.RestaurantTableResponse;
import com.quickserve.backend.entity.TableStatus;
import com.quickserve.backend.service.RestaurantTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    /**
     * POST /api/tables
     * Creates a new restaurant table.
     */
    @PostMapping
    public ResponseEntity<RestaurantTableResponse> createTable(@Valid @RequestBody RestaurantTableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.createTable(request));
    }

    /**
     * GET /api/tables
     * Returns all restaurant tables.
     */
    @GetMapping
    public ResponseEntity<List<RestaurantTableResponse>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }

    /**
     * GET /api/tables/{id}
     * Returns a single table by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTableResponse> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    /**
     * GET /api/tables/qr/{qrCode}
     * Returns a table by its QR code.
     */
    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<RestaurantTableResponse> getTableByQrCode(@PathVariable String qrCode) {
        return ResponseEntity.ok(tableService.getTableByQrCode(qrCode));
    }

    /**
     * GET /api/tables/status/{status}
     * Returns all tables matching a given status.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RestaurantTableResponse>> getTablesByStatus(@PathVariable TableStatus status) {
        return ResponseEntity.ok(tableService.getTablesByStatus(status));
    }

    /**
     * PUT /api/tables/{id}
     * Updates an existing table.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTableResponse> updateTable(@PathVariable Long id,
                                                               @Valid @RequestBody RestaurantTableRequest request) {
        return ResponseEntity.ok(tableService.updateTable(id, request));
    }

    /**
     * PATCH /api/tables/{id}/activate
     * Activates a table.
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<RestaurantTableResponse> activateTable(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.activateTable(id));
    }

    /**
     * PATCH /api/tables/{id}/deactivate
     * Deactivates a table.
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<RestaurantTableResponse> deactivateTable(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.deactivateTable(id));
    }

    /**
     * DELETE /api/tables/{id}
     * Permanently deletes a table.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}
