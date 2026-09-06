package com.quickserve.backend.service.impl;

import com.quickserve.backend.dto.ServiceRequestRequest;
import com.quickserve.backend.dto.ServiceRequestResponse;
import com.quickserve.backend.entity.RequestStatus;
import com.quickserve.backend.entity.ServiceRequest;
import com.quickserve.backend.exception.ResourceNotFoundException;
import com.quickserve.backend.repository.ServiceRequestRepository;
import com.quickserve.backend.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final com.quickserve.backend.service.TableSessionService sessionService;
    private final com.quickserve.backend.service.NotificationService notificationService;

    @Override
    public ServiceRequestResponse createRequest(ServiceRequestRequest request) {
        // Enforce active customer table session
        sessionService.validateActiveSession(request.getSessionToken(), request.getTableNumber());

        ServiceRequest serviceRequest = ServiceRequest.builder()
                .tableNumber(request.getTableNumber().trim())
                .requestType(request.getRequestType())
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .status(RequestStatus.PENDING)
                .build();

        ServiceRequest saved = requestRepository.save(serviceRequest);

        // Lifecycle: REQUEST_BILL closes the customer table session and frees the table
        if (request.getRequestType() == com.quickserve.backend.entity.RequestType.REQUEST_BILL) {
            sessionService.closeSessionForTable(request.getTableNumber());
        }

        // Notify owner of service request
        String notificationTitle = buildNotificationTitle(request.getRequestType(), request.getTableNumber().trim());
        String notificationMessage = request.getNotes() != null && !request.getNotes().isBlank()
                ? request.getNotes()
                : "Table " + request.getTableNumber() + " - " + request.getRequestType().name().replace('_', ' ');

        notificationService.createNotification(
                notificationTitle,
                notificationMessage,
                "REQUEST",
                saved.getId(),
                request.getTableNumber().trim()
        );

        return toResponse(saved);
    }

    private String buildNotificationTitle(com.quickserve.backend.entity.RequestType type, String tableNumber) {
        switch (type) {
            case REQUEST_BILL:
                return "Table " + tableNumber + " requested the Bill";
            case WATER:
                return "Table " + tableNumber + " requested Water";
            case CALL_WAITER:
                return "Table " + tableNumber + " called the Waiter";
            case CUTLERY:
                return "Table " + tableNumber + " requested Cutlery";
            case TISSUE:
                return "Table " + tableNumber + " requested Tissue";
            default:
                return "Table " + tableNumber + " requested " + type.name().replace('_', ' ');
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRequestResponse getRequestById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getRequestsByStatus(RequestStatus status) {
        return requestRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceRequestResponse updateRequestStatus(Long id, RequestStatus newStatus) {
        ServiceRequest request = findOrThrow(id);
        
        request.setStatus(newStatus);
        
        if (newStatus == RequestStatus.COMPLETED && request.getCompletedAt() == null) {
            request.setCompletedAt(LocalDateTime.now());
        }

        return toResponse(requestRepository.save(request));
    }

    @Override
    public void deleteRequest(Long id) {
        if (!requestRepository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceRequest", id);
        }
        requestRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private ServiceRequest findOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id));
    }

    private ServiceRequestResponse toResponse(ServiceRequest request) {
        return ServiceRequestResponse.builder()
                .id(request.getId())
                .tableNumber(request.getTableNumber())
                .requestType(request.getRequestType())
                .status(request.getStatus())
                .notes(request.getNotes())
                .createdAt(request.getCreatedAt())
                .completedAt(request.getCompletedAt())
                .build();
    }
}
