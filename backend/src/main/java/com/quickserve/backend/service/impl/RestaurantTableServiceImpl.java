package com.quickserve.backend.service.impl;

import com.quickserve.backend.dto.RestaurantTableRequest;
import com.quickserve.backend.dto.RestaurantTableResponse;
import com.quickserve.backend.entity.RestaurantTable;
import com.quickserve.backend.entity.TableStatus;
import com.quickserve.backend.exception.DuplicateResourceException;
import com.quickserve.backend.exception.ResourceNotFoundException;
import com.quickserve.backend.repository.RestaurantTableRepository;
import com.quickserve.backend.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantTableServiceImpl implements RestaurantTableService {

    private final RestaurantTableRepository tableRepository;

    @Override
    public RestaurantTableResponse createTable(RestaurantTableRequest request) {
        if (tableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new DuplicateResourceException("RestaurantTable", "tableNumber",
                    String.valueOf(request.getTableNumber()));
        }
        if (tableRepository.existsByQrCode(request.getQrCode())) {
            throw new DuplicateResourceException("RestaurantTable", "qrCode", request.getQrCode());
        }

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .qrCode(request.getQrCode().trim())
                .status(request.getStatus() != null ? request.getStatus() : TableStatus.AVAILABLE)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toResponse(tableRepository.save(table));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTableResponse> getAllTables() {
        return tableRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantTableResponse getTableById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantTableResponse getTableByQrCode(String qrCode) {
        RestaurantTable table = tableRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "qrCode: " + qrCode));
        return toResponse(table);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTableResponse> getTablesByStatus(TableStatus status) {
        return tableRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RestaurantTableResponse updateTable(Long id, RestaurantTableRequest request) {
        RestaurantTable existing = findOrThrow(id);

        // Check uniqueness only if the value is changing
        if (!existing.getTableNumber().equals(request.getTableNumber())
                && tableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new DuplicateResourceException("RestaurantTable", "tableNumber",
                    String.valueOf(request.getTableNumber()));
        }
        if (!existing.getQrCode().equals(request.getQrCode())
                && tableRepository.existsByQrCode(request.getQrCode())) {
            throw new DuplicateResourceException("RestaurantTable", "qrCode", request.getQrCode());
        }

        existing.setTableNumber(request.getTableNumber());
        existing.setCapacity(request.getCapacity());
        existing.setQrCode(request.getQrCode().trim());
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }
        // createdAt is preserved automatically (updatable = false)

        return toResponse(tableRepository.save(existing));
    }

    @Override
    public void deleteTable(Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResourceNotFoundException("RestaurantTable", id);
        }
        tableRepository.deleteById(id);
    }

    @Override
    public RestaurantTableResponse activateTable(Long id) {
        RestaurantTable table = findOrThrow(id);
        table.setActive(true);
        return toResponse(tableRepository.save(table));
    }

    @Override
    public RestaurantTableResponse deactivateTable(Long id) {
        RestaurantTable table = findOrThrow(id);
        table.setActive(false);
        return toResponse(tableRepository.save(table));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private RestaurantTable findOrThrow(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", id));
    }

    private RestaurantTableResponse toResponse(RestaurantTable table) {
        return RestaurantTableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .qrCode(table.getQrCode())
                .status(table.getStatus())
                .active(table.getActive())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }
}
