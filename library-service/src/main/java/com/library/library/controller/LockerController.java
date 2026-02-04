package com.library.library.controller;

import com.library.library.model.Locker;
import com.library.library.model.LockerBooking;
import com.library.library.service.LockerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lockers")
public class LockerController {

    @Autowired
    private LockerService lockerService;

    @GetMapping
    public List<Locker> getAllLockers() {
        return lockerService.getAllLockers();
    }

    @PostMapping
    public Locker createLocker(@RequestBody Locker locker) {
        return lockerService.createLocker(locker);
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookLocker(
            @RequestParam("userId") Long userId,
            @RequestParam("lockerId") Long lockerId,
            @RequestParam("durationMonths") int durationMonths,
            @RequestParam(value = "paymentScreenshot", required = false) org.springframework.web.multipart.MultipartFile paymentScreenshot) {
        try {
            String screenshotBase64 = null;
            if (paymentScreenshot != null && !paymentScreenshot.isEmpty()) {
                byte[] bytes = paymentScreenshot.getBytes();
                screenshotBase64 = java.util.Base64.getEncoder().encodeToString(bytes);
            }

            LockerBooking booking = lockerService.bookLocker(userId, lockerId, durationMonths, screenshotBase64);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/verify/{bookingId}")
    public ResponseEntity<?> verifyBooking(@PathVariable Long bookingId, @RequestParam boolean isApproved) {
        try {
            LockerBooking booking = lockerService.verifyBooking(bookingId, isApproved);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            LockerBooking booking = lockerService.cancelBooking(bookingId);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public List<LockerBooking> getAllBookings() {
        return lockerService.getAllBookings();
    }

    @GetMapping("/user/{userId}")
    public List<LockerBooking> getUserBookings(@PathVariable Long userId) {
        return lockerService.getUserBookings(userId);
    }

    @PutMapping("/{id}/price")
    public Locker updateLockerPrice(@PathVariable Long id, @RequestParam Double newPrice) {
        return lockerService.updateLockerPrice(id, newPrice);
    }
}
