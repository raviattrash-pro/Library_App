package com.library.library.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "print_requests")
public class PrintRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String fileUrl;

    private String fileName;

    private String printType; // "Black & White", "Color"

    private int copies;

    private Double resultCost;

    private String paymentScreenshotUrl;

    private String status; // "Pending", "Verified", "Printed", "Completed"

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "Pending";
        }
    }
}
