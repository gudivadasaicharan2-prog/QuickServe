package com.quickserve.backend.service;

import com.quickserve.backend.dto.ServiceRequestRequest;
import com.quickserve.backend.dto.ServiceRequestResponse;
import com.quickserve.backend.entity.RequestStatus;

import java.util.List;

public interface ServiceRequestService {

    /**
     * Creates a new service request from a table.
     */
    ServiceRequestResponse createRequest(ServiceRequestRequest request);

    /**
     * Returns a service request by ID.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    ServiceRequestResponse getRequestById(Long id);

    /**
     * Returns all service requests, newest first.
     */
    List<ServiceRequestResponse> getAllRequests();

    /**
     * Returns all service requests matching the given status, newest first.
     */
    List<ServiceRequestResponse> getRequestsByStatus(RequestStatus status);

    /**
     * Updates the status of an existing request.
     * If the new status is COMPLETED, automatically sets the completedAt timestamp.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    ServiceRequestResponse updateRequestStatus(Long id, RequestStatus newStatus);

    /**
     * Deletes a request permanently.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    void deleteRequest(Long id);
}
