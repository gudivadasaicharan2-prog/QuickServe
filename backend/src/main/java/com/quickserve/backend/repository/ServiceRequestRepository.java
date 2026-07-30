package com.quickserve.backend.repository;

import com.quickserve.backend.entity.RequestStatus;
import com.quickserve.backend.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findAllByOrderByCreatedAtDesc();

    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
}
