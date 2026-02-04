package com.library.library.service;

import com.library.library.model.Expenditure;
import com.library.library.model.LockerBooking;
import com.library.library.repository.ExpenditureRepository;
import com.library.library.repository.LockerBookingRepository;
import com.library.library.repository.OrderRepository;
import com.library.library.repository.PrintRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    private final ExpenditureRepository expenditureRepository;
    private final LockerBookingRepository lockerBookingRepository;
    private final PrintRequestRepository printRequestRepository;
    private final OrderRepository orderRepository;

    public FinanceService(ExpenditureRepository expenditureRepository,
            LockerBookingRepository lockerBookingRepository,
            PrintRequestRepository printRequestRepository,
            OrderRepository orderRepository) {
        this.expenditureRepository = expenditureRepository;
        this.lockerBookingRepository = lockerBookingRepository;
        this.printRequestRepository = printRequestRepository;
        this.orderRepository = orderRepository;
    }

    // Expenditure Methods
    @Transactional
    public Expenditure addExpenditure(Expenditure expenditure) {
        return expenditureRepository.save(expenditure);
    }

    @Transactional(readOnly = true)
    public List<Expenditure> getAllExpenditures() {
        return expenditureRepository.findAll();
    }

    @Transactional
    public void deleteExpenditure(Long id) {
        expenditureRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Double getTotalExpenditure() {
        Double total = expenditureRepository.sumTotalExpenditure();
        return total != null ? total : 0.0;
    }

    // Revenue Methods
    @Transactional(readOnly = true)
    public Map<String, Double> getLibraryRevenueBreakdown() {
        // Locker Revenue
        Double lockerRevenue = lockerBookingRepository.sumAmountByStatus(LockerBooking.LockerBookingStatus.ACTIVE);
        if (lockerRevenue == null)
            lockerRevenue = 0.0;

        // Print Revenue (Verified, Printed, Completed)
        Double printRevenue = printRequestRepository
                .sumResultCostByStatusIn(Arrays.asList("Verified", "Printed", "Completed"));
        if (printRevenue == null)
            printRevenue = 0.0;

        // Order Revenue (Snacks/Stationary) (Verified, Delivered)
        Double orderRevenue = orderRepository.sumTotalAmountByStatusIn(Arrays.asList("Verified", "Delivered"));
        if (orderRevenue == null)
            orderRevenue = 0.0;

        Map<String, Double> breakdown = new HashMap<>();
        breakdown.put("lockerRevenue", lockerRevenue);
        breakdown.put("printRevenue", printRevenue);
        breakdown.put("snackRevenue", orderRevenue);

        return breakdown;
    }
}
