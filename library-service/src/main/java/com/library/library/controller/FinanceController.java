package com.library.library.controller;

import com.library.library.model.Expenditure;
import com.library.library.service.FinanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    // Expenditure Endpoints
    @PostMapping("/expenditures")
    public ResponseEntity<Expenditure> addExpenditure(@RequestBody Expenditure expenditure) {
        return ResponseEntity.ok(financeService.addExpenditure(expenditure));
    }

    @GetMapping("/expenditures")
    public ResponseEntity<List<Expenditure>> getAllExpenditures() {
        return ResponseEntity.ok(financeService.getAllExpenditures());
    }

    @DeleteMapping("/expenditures/{id}")
    public ResponseEntity<Void> deleteExpenditure(@PathVariable Long id) {
        financeService.deleteExpenditure(id);
        return ResponseEntity.ok().build();
    }

    // Stats Endpoint (Returns Expenditures Total + Library Sources Revenues)
    // Seat Revenue must be fetched from Booking Service separately by the frontend.
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getFinanceStats() {
        Map<String, Double> revenues = financeService.getLibraryRevenueBreakdown();
        Double totalExpenditure = financeService.getTotalExpenditure();

        return ResponseEntity.ok(Map.of(
                "revenues", revenues,
                "totalExpenditure", totalExpenditure));
    }
}
