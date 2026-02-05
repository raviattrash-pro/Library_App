package com.library.library.controller;

import com.library.library.model.DeskAttendance;
import com.library.library.service.DeskAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")

public class DeskAttendanceController {

    @Autowired
    private DeskAttendanceService service;

    @PostMapping("/scan")
    public ResponseEntity<?> scanQr(@RequestParam Long userId, @RequestParam String qrContent) {
        // qrContent could be the seat number or a special token
        // For now assuming qrContent IS the seat ID
        try {
            // Logic: If user is checked in, check them out. If not, check them in.
            DeskAttendance current = service.getCurrentSession(userId);
            if (current != null) {
                return ResponseEntity.ok(service.checkOut(userId));
            } else {
                return ResponseEntity.ok(service.checkIn(userId, qrContent));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/current")
    public ResponseEntity<DeskAttendance> getCurrentSession(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getCurrentSession(userId));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam Long userId) {
        long minutes = service.getTodayStudyMinutes(userId);
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("totalMinutes", minutes);
        response.put("formattedTime", String.format("%dh %02dm", hours, remainingMinutes));

        return ResponseEntity.ok(response);
    }
}
