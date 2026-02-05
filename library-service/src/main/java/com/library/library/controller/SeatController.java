package com.library.library.controller;

import com.library.library.model.Seat;
import com.library.library.service.SeatService;
import com.library.library.config.DataSeeder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/seats")
@Tag(name = "Seat Management", description = "Manage library seats")
public class SeatController {

    private final SeatService seatService;
    private final DataSeeder dataSeeder;

    public SeatController(SeatService seatService, DataSeeder dataSeeder) {
        this.seatService = seatService;
        this.dataSeeder = dataSeeder;
    }

    @GetMapping
    @Operation(summary = "Get all seats")
    public ResponseEntity<List<Seat>> getAllSeats() {
        return ResponseEntity.ok(seatService.getAllSeats());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get seat by ID with HATEOAS links")
    public ResponseEntity<EntityModel<Seat>> getSeatById(@PathVariable Long id) {
        Seat seat = seatService.getSeatById(id);
        EntityModel<Seat> resource = EntityModel.of(seat);
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(SeatController.class).getSeatById(id))
                .withSelfRel());
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(SeatController.class).getAllSeats())
                .withRel("all-seats"));
        return ResponseEntity.ok(resource);
    }

    @GetMapping("/available")
    @Operation(summary = "Get available seats")
    public ResponseEntity<List<Seat>> getAvailableSeats() {
        return ResponseEntity.ok(seatService.getAvailableSeats());
    }

    @PostMapping
    @Operation(summary = "Create new seat")
    public ResponseEntity<Seat> createSeat(@RequestBody Seat seat) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seatService.createSeat(seat));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update seat")
    public ResponseEntity<Seat> updateSeat(@PathVariable Long id, @RequestBody Seat seat) {
        return ResponseEntity.ok(seatService.updateSeat(id, seat));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete seat")
    public ResponseEntity<Void> deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update seat status")
    public ResponseEntity<Seat> updateSeatStatus(@PathVariable Long id, @RequestParam Seat.SeatStatus status) {
        System.out.println("Received request to update seat " + id + " to status " + status);
        try {
            Seat updatedSeat = seatService.updateSeatStatus(id, status);
            System.out.println("Successfully updated seat " + id + " to " + status);
            return ResponseEntity.ok(updatedSeat);
        } catch (Exception e) {
            System.err.println("Error updating seat " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset all seats - Deletes all and re-seeds with 280 seats (56 per room)")
    public ResponseEntity<Map<String, Object>> resetSeats() {
        seatService.deleteAllSeats();
        dataSeeder.run(); // Re-run the seeder
        long newCount = seatService.count();
        return ResponseEntity.ok(Map.of(
                "message", "Seats reset successfully",
                "totalSeats", newCount,
                "seatsPerRoom", 56,
                "studentSeats", 48,
                "teacherSeats", 8));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Library Service is running");
    }
}
