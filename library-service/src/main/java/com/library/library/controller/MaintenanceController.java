package com.library.library.controller;

import com.library.library.model.MaintenanceRequest;
import com.library.library.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/maintenance")
@CrossOrigin(origins = "*") // Allow requests from React frontend
public class MaintenanceController {

    @Autowired
    private MaintenanceService service;

    // Directory for saving uploaded images (example path, adjust as needed)
    private final Path fileStorageLocation = Paths.get("uploads/maintenance").toAbsolutePath().normalize();

    public MaintenanceController() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequest> createRequest(
            @RequestParam("userId") Long userId,
            @RequestParam("userName") String userName,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("userPhone") String userPhone,
            @RequestParam("type") String type,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile file) {

        MaintenanceRequest request = new MaintenanceRequest();
        request.setUserId(userId);
        request.setUserName(userName);
        request.setUserEmail(userEmail);
        request.setUserPhone(userPhone);
        request.setType(type);
        request.setDescription(description);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                // In production, return a full URL or relative URL handled by a static resource
                // handler
                request.setPhotoUrl("/uploads/maintenance/" + fileName);
            } catch (IOException ex) {
                // Log and handle error
                ex.printStackTrace();
            }
        }

        return ResponseEntity.ok(service.createRequest(request));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MaintenanceRequest>> getRequestsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getRequestsByUserId(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MaintenanceRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        MaintenanceRequest updatedRequest = service.updateStatus(id, status);
        if (updatedRequest != null) {
            return ResponseEntity.ok(updatedRequest);
        }
        return ResponseEntity.notFound().build();
    }
}
