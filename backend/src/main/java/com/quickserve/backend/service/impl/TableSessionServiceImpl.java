package com.quickserve.backend.service.impl;

import com.quickserve.backend.config.RestaurantLocationConfig;
import com.quickserve.backend.dto.TableClaimRequest;
import com.quickserve.backend.dto.TableSessionResponse;
import com.quickserve.backend.entity.RestaurantTable;
import com.quickserve.backend.entity.SessionStatus;
import com.quickserve.backend.entity.TableSession;
import com.quickserve.backend.entity.TableStatus;
import com.quickserve.backend.exception.LocationException;
import com.quickserve.backend.exception.ResourceNotFoundException;
import com.quickserve.backend.exception.SessionException;
import com.quickserve.backend.repository.RestaurantTableRepository;
import com.quickserve.backend.repository.TableSessionRepository;
import com.quickserve.backend.service.TableSessionService;
import com.quickserve.backend.util.HaversineUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TableSessionServiceImpl implements TableSessionService {

    private final TableSessionRepository tableSessionRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantLocationConfig locationConfig;

    @Override
    public TableSessionResponse claimTable(TableClaimRequest request) {
        // 1. Enforce location security on backend
        double distance = HaversineUtil.distanceMeters(
                locationConfig.getLatitude(),
                locationConfig.getLongitude(),
                request.getLatitude(),
                request.getLongitude()
        );

        if (distance > locationConfig.getRadiusMeters()) {
            log.warn("[Location] Customer attempted table claim at distance {}m (limit: {}m)",
                    distance, locationConfig.getRadiusMeters());
            throw new LocationException("You must be at the restaurant to access QuickServe.");
        }

        // 2. Atomic table claim via pessimistic write lock on row
        RestaurantTable table = tableRepository.findByTableNumberForUpdate(request.getTableNumber())
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "tableNumber: " + request.getTableNumber()));

        if (!Boolean.TRUE.equals(table.getActive())) {
            throw new IllegalArgumentException("Table " + request.getTableNumber() + " is currently inactive.");
        }

        // 3. Reject if table is already OCCUPIED or has an active session
        if (table.getStatus() == TableStatus.OCCUPIED ||
                tableSessionRepository.existsByRestaurantTableAndStatus(table, SessionStatus.ACTIVE)) {
            log.warn("[TableClaim] Table {} is already occupied", request.getTableNumber());
            throw new IllegalStateException("Table " + request.getTableNumber() + " is currently occupied. Please choose another table.");
        }

        // 4. Mark table as OCCUPIED
        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        // 5. Create active customer table session
        TableSession session = TableSession.builder()
                .sessionToken(UUID.randomUUID().toString())
                .restaurantTable(table)
                .tableNumber(table.getTableNumber())
                .status(SessionStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusHours(4))
                .build();

        TableSession savedSession = tableSessionRepository.save(session);
        log.info("[TableClaim] Table {} claimed successfully with sessionToken: {}",
                table.getTableNumber(), savedSession.getSessionToken());

        return toResponse(savedSession);
    }

    @Override
    @Transactional(readOnly = true)
    public TableSessionResponse getActiveSessionByToken(String token) {
        if (token == null || token.isBlank()) {
            throw new SessionException("Session token is missing.");
        }

        TableSession session = tableSessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new SessionException("Invalid table session."));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new SessionException("Your table session has ended.");
        }

        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateActiveSession(String token, String expectedTableNumber) {
        if (token == null || token.isBlank()) {
            throw new SessionException("Active table session required. Please claim an available table.");
        }

        TableSession session = tableSessionRepository.findBySessionToken(token.trim())
                .orElseThrow(() -> new SessionException("Invalid table session."));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new SessionException("Your table session has ended. You cannot place orders or requests with a closed session.");
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new SessionException("Your table session has expired. Please claim an available table.");
        }

        if (expectedTableNumber != null && !expectedTableNumber.isBlank()) {
            String sessionTableStr = String.valueOf(session.getTableNumber()).trim();
            if (!sessionTableStr.equalsIgnoreCase(expectedTableNumber.trim())) {
                throw new SessionException("Session is for Table " + sessionTableStr + ", but operation targeted Table " + expectedTableNumber);
            }
        }
    }

    @Override
    public void closeSessionForTable(String tableNumber) {
        if (tableNumber == null || tableNumber.isBlank()) return;

        try {
            int tblNum = Integer.parseInt(tableNumber.trim());
            Optional<TableSession> activeSession = tableSessionRepository.findByTableNumberAndStatus(tblNum, SessionStatus.ACTIVE);
            if (activeSession.isPresent()) {
                TableSession session = activeSession.get();
                session.setStatus(SessionStatus.CLOSED);
                session.setClosedAt(LocalDateTime.now());
                tableSessionRepository.save(session);
                log.info("[Session] Closed session for Table {}", tblNum);
            }

            Optional<RestaurantTable> tableOpt = tableRepository.findByTableNumber(tblNum);
            if (tableOpt.isPresent()) {
                RestaurantTable table = tableOpt.get();
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
                log.info("[Session] Table {} status set to AVAILABLE", tblNum);
            }
        } catch (NumberFormatException e) {
            log.error("[Session] Invalid tableNumber format: {}", tableNumber);
        }
    }

    @Override
    public void closeSessionByToken(String token) {
        if (token == null || token.isBlank()) return;

        tableSessionRepository.findBySessionToken(token.trim()).ifPresent(session -> {
            session.setStatus(SessionStatus.CLOSED);
            session.setClosedAt(LocalDateTime.now());
            tableSessionRepository.save(session);

            RestaurantTable table = session.getRestaurantTable();
            if (table != null) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
            log.info("[Session] Closed session {} for Table {}", token, session.getTableNumber());
        });
    }

    private TableSessionResponse toResponse(TableSession session) {
        return TableSessionResponse.builder()
                .sessionToken(session.getSessionToken())
                .tableNumber(session.getTableNumber())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .expiresAt(session.getExpiresAt())
                .build();
    }
}
