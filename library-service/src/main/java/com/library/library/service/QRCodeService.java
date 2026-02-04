package com.library.library.service;

import com.library.library.model.QRCode;
import com.library.library.repository.QRCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class QRCodeService {

    @Autowired
    private QRCodeRepository qrCodeRepository;

    // Get the current active QR code
    public Optional<QRCode> getCurrentQRCode() {
        return qrCodeRepository.findFirstByOrderByUpdatedAtDesc();
    }

    // Upload or update QR code
    public QRCode saveQRCode(String imageUrl, String upiId) {
        // Get existing QR code or create new one
        Optional<QRCode> existingQR = getCurrentQRCode();

        QRCode qrCode;
        if (existingQR.isPresent()) {
            // Update existing
            qrCode = existingQR.get();
            qrCode.setImageUrl(imageUrl);
            qrCode.setUpiId(upiId);
            qrCode.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new
            qrCode = new QRCode(imageUrl, upiId);
        }

        return qrCodeRepository.save(qrCode);
    }

    // Delete QR code
    public void deleteQRCode(Long id) {
        qrCodeRepository.deleteById(id);
    }
}
