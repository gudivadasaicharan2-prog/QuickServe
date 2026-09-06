package com.quickserve.backend.controller;

import com.quickserve.backend.dto.TableClaimRequest;
import com.quickserve.backend.dto.TableSessionResponse;
import com.quickserve.backend.service.TableSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class TableSessionController {

    private final TableSessionService sessionService;

    /**
     * POST /api/sessions/claim
     * Validates GPS location and atomically claims an available table.
     */
    @PostMapping("/claim")
    public ResponseEntity<TableSessionResponse> claimTable(@Valid @RequestBody TableClaimRequest request) {
        TableSessionResponse response = sessionService.claimTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/sessions/{token}
     * Returns details of an active session.
     */
    @GetMapping("/{token}")
    public ResponseEntity<TableSessionResponse> getActiveSession(@PathVariable String token) {
        return ResponseEntity.ok(sessionService.getActiveSessionByToken(token));
    }

    /**
     * POST /api/sessions/{token}/close
     * Closes an active session.
     */
    @PostMapping("/{token}/close")
    public ResponseEntity<Map<String, String>> closeSession(@PathVariable String token) {
        sessionService.closeSessionByToken(token);
        return ResponseEntity.ok(Map.of("message", "Session closed successfully"));
    }
}
