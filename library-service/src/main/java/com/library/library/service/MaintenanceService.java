package com.library.library.service;

import com.library.library.model.MaintenanceRequest;
import com.library.library.repository.MaintenanceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRequestRepository repository;

    public MaintenanceRequest createRequest(MaintenanceRequest request) {
        return repository.save(request);
    }

    public List<MaintenanceRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<MaintenanceRequest> getRequestsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public MaintenanceRequest updateStatus(Long id, String status) {
        Optional<MaintenanceRequest> optionalRequest = repository.findById(id);
        if (optionalRequest.isPresent()) {
            MaintenanceRequest request = optionalRequest.get();
            request.setStatus(status);
            return repository.save(request);
        }
        return null; // Or throw exception
    }
}
