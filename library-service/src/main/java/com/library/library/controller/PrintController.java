package com.library.library.controller;

import com.library.library.model.PrintRequest;
import com.library.library.service.PrintService;
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
@RequestMapping("/print")
@CrossOrigin(origins = "*")
public class PrintController {

    @Autowired
    private PrintService service;

    private final Path fileStorageLocation = Paths.get("uploads/print").toAbsolutePath().normalize();

    public PrintController() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<PrintRequest> createRequest(
            @RequestParam("userId") Long userId,
            @RequestParam("printType") String printType,
            @RequestParam("copies") int copies,
            @RequestParam("cost") Double cost,
            @RequestParam("document") MultipartFile document,
            @RequestParam("payment") MultipartFile payment) {

        PrintRequest request = new PrintRequest();
        request.setUserId(userId);
        request.setPrintType(printType);
        request.setCopies(copies);
        request.setResultCost(cost);

        // Save Document
        if (document != null && !document.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + document.getOriginalFilename();
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(document.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                request.setFileUrl("/uploads/print/" + fileName);
                request.setFileName(document.getOriginalFilename());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }

        // Save Payment
        if (payment != null && !payment.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_PAY_" + payment.getOriginalFilename();
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(payment.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                request.setPaymentScreenshotUrl("/uploads/print/" + fileName);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }

        return ResponseEntity.ok(service.createRequest(request));
    }

    @GetMapping
    public ResponseEntity<List<PrintRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PrintRequest>> getRequestsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getRequestsByUser(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PrintRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        PrintRequest updated = service.updateStatus(id, status);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @Autowired
    private com.library.library.service.PrintSettingsService settingsService;

    // ... (existing constructor and CREATE request) ...

    @GetMapping("/settings")
    public ResponseEntity<com.library.library.model.PrintSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<com.library.library.model.PrintSettings> updateSettings(
            @RequestParam(required = false) Double blackAndWhiteCost,
            @RequestParam(required = false) Double colorCost) {
        return ResponseEntity.ok(settingsService.updateSettings(blackAndWhiteCost, colorCost));
    }
}
