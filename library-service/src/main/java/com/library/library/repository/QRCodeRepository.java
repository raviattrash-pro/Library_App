package com.library.library.repository;

import com.library.library.model.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    // Get the most recently updated QR code
    Optional<QRCode> findFirstByOrderByUpdatedAtDesc();
}
