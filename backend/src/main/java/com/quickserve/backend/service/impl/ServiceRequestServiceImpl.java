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

    @Override
    public ServiceRequestResponse createRequest(ServiceRequestRequest request) {
        ServiceRequest serviceRequest = ServiceRequest.builder()
                .tableNumber(request.getTableNumber().trim())
                .requestType(request.getRequestType())
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .status(RequestStatus.PENDING)
                .build();

        return toResponse(requestRepository.save(serviceRequest));
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
