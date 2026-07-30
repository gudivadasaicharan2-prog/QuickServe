package com.quickserve.backend.controller;

import com.quickserve.backend.dto.ServiceRequestRequest;
import com.quickserve.backend.dto.ServiceRequestResponse;
import com.quickserve.backend.dto.ServiceRequestStatusUpdateRequest;
import com.quickserve.backend.entity.RequestStatus;
import com.quickserve.backend.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    /**
     * POST /api/requests
     * Creates a new service request.
     */
    @PostMapping
    public ResponseEntity<ServiceRequestResponse> createRequest(@Valid @RequestBody ServiceRequestRequest request) {
        ServiceRequestResponse created = requestService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/requests
     * Returns all requests, newest first.
     */
    @GetMapping
    public ResponseEntity<List<ServiceRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    /**
     * GET /api/requests/{id}
     * Returns a specific request by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getRequestById(id));
    }

    /**
     * GET /api/requests/status/{status}
     * Returns requests matching a specific status.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServiceRequestResponse>> getRequestsByStatus(@PathVariable RequestStatus status) {
        return ResponseEntity.ok(requestService.getRequestsByStatus(status));
    }

    /**
     * PATCH /api/requests/{id}/status
     * Updates the status of an existing request.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceRequestResponse> updateRequestStatus(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequestStatusUpdateRequest request) {
        return ResponseEntity.ok(requestService.updateRequestStatus(id, request.getStatus()));
    }

    /**
     * DELETE /api/requests/{id}
     * Deletes a request permanently.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
