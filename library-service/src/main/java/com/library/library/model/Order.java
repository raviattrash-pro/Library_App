package com.library.library.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String seatNumber;

    @Column(columnDefinition = "TEXT")
    private String itemsJson; // JSON string of items ordered: [{"itemId": 1, "name": "Coffee", "quantity": 2,
                              // "price": 50}]

    private Double totalAmount;

    private String paymentScreenshotUrl;

    private String status; // "Pending", "Verified", "Delivered", "Cancelled"

    private LocalDateTime orderTime;

    @PrePersist
    protected void onCreate() {
        orderTime = LocalDateTime.now();
        if (status == null) {
            status = "Pending";
        }
    }
}
