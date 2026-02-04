package com.library.library.controller;

import com.library.library.model.Order;
import com.library.library.service.OrderingService;
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
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderingService service;

    // Directory for saving order screenshots
    private final Path fileStorageLocation = Paths.get("uploads/orders").toAbsolutePath().normalize();

    public OrderController() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestParam("userId") Long userId,
            @RequestParam("userName") String userName,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("userPhone") String userPhone,
            @RequestParam("seatNumber") String seatNumber,
            @RequestParam("itemsJson") String itemsJson,
            @RequestParam("totalAmount") Double totalAmount,
            @RequestParam("paymentScreenshot") MultipartFile file) {

        Order order = new Order();
        order.setUserId(userId);
        order.setUserName(userName);
        order.setUserEmail(userEmail);
        order.setUserPhone(userPhone);
        order.setSeatNumber(seatNumber);
        order.setItemsJson(itemsJson);
        order.setTotalAmount(totalAmount);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                order.setPaymentScreenshotUrl("/uploads/orders/" + fileName);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }

        return ResponseEntity.ok(service.placeOrder(order));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getOrdersByUser(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Order updated = service.updateOrderStatus(id, status);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
