package com.library.library.controller;

import com.library.library.model.Shift;
import com.library.library.service.ShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shifts")
@Tag(name = "Shift Management", description = "Manage library shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    @Operation(summary = "Get all shifts")
    public ResponseEntity<List<Shift>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shift by ID")
    public ResponseEntity<Shift> getShiftById(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.getShiftById(id));
    }

    @PostMapping
    @Operation(summary = "Create new shift")
    public ResponseEntity<Shift> createShift(@RequestBody Shift shift) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shiftService.createShift(shift));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update shift")
    public ResponseEntity<Shift> updateShift(@PathVariable Long id, @RequestBody Shift shift) {
        return ResponseEntity.ok(shiftService.updateShift(id, shift));
    }

    @PutMapping("/{id}/price")
    @Operation(summary = "Update shift price")
    public ResponseEntity<Shift> updateShiftPrice(@PathVariable Long id, @RequestParam Double price) {
        return ResponseEntity.ok(shiftService.updateShiftPrice(id, price));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete shift")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
        return ResponseEntity.noContent().build();
    }
}
