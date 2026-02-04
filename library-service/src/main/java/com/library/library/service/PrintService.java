package com.library.library.service;

import com.library.library.model.PrintRequest;
import com.library.library.repository.PrintRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrintService {

    @Autowired
    private PrintRequestRepository repository;

    public PrintRequest createRequest(PrintRequest request) {
        return repository.save(request);
    }

    public List<PrintRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<PrintRequest> getRequestsByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    public PrintRequest updateStatus(Long id, String status) {
        Optional<PrintRequest> req = repository.findById(id);
        if (req.isPresent()) {
            PrintRequest r = req.get();
            r.setStatus(status);
            return repository.save(r);
        }
        return null; // Or exception
    }
}
