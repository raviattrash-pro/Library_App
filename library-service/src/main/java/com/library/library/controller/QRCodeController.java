package com.library.library.controller;

import com.library.library.model.QRCode;
import com.library.library.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/qr")
@CrossOrigin(origins = "*")
public class QRCodeController {

    @Autowired
    private QRCodeService qrCodeService;

    // Get current QR code
    @GetMapping
    public ResponseEntity<?> getCurrentQRCode() {
        Optional<QRCode> qrCode = qrCodeService.getCurrentQRCode();
        if (qrCode.isPresent()) {
            return ResponseEntity.ok(qrCode.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Upload new QR code
    @PostMapping
    public ResponseEntity<?> uploadQRCode(@RequestBody Map<String, String> payload) {
        try {
            String imageUrl = payload.get("imageUrl");
            String upiId = payload.get("upiId");

            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Image URL is required"));
            }

            if (upiId == null || upiId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "UPI ID is required"));
            }

            QRCode qrCode = qrCodeService.saveQRCode(imageUrl, upiId);
            return ResponseEntity.ok(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload QR code: " + e.getMessage()));
        }
    }

    // Update QR code
    @PutMapping
    public ResponseEntity<?> updateQRCode(@RequestBody Map<String, String> payload) {
        try {
            String imageUrl = payload.get("imageUrl");
            String upiId = payload.get("upiId");

            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Image URL is required"));
            }

            if (upiId == null || upiId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "UPI ID is required"));
            }

            QRCode qrCode = qrCodeService.saveQRCode(imageUrl, upiId);
            return ResponseEntity.ok(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to update QR code: " + e.getMessage()));
        }
    }

    // Delete QR code
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQRCode(@PathVariable Long id) {
        try {
            qrCodeService.deleteQRCode(id);
            return ResponseEntity.ok(Map.of("message", "QR code deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to delete QR code: " + e.getMessage()));
        }
    }
}
