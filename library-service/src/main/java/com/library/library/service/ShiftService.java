package com.library.library.service;

import com.library.library.model.Shift;
import com.library.library.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftService(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    @Transactional(readOnly = true)
    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Shift getShiftById(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
    }

    @Transactional
    public Shift createShift(Shift shift) {
        return shiftRepository.save(shift);
    }

    @Transactional
    public Shift updateShift(Long id, Shift updatedShift) {
        Shift shift = getShiftById(id);
        if (updatedShift.getName() != null)
            shift.setName(updatedShift.getName());
        if (updatedShift.getStartTime() != null)
            shift.setStartTime(updatedShift.getStartTime());
        if (updatedShift.getEndTime() != null)
            shift.setEndTime(updatedShift.getEndTime());
        if (updatedShift.getBasePrice() != null)
            shift.setBasePrice(updatedShift.getBasePrice());
        if (updatedShift.getDescription() != null)
            shift.setDescription(updatedShift.getDescription());
        return shiftRepository.save(shift);
    }

    @Transactional
    public Shift updateShiftPrice(Long id, Double price) {
        Shift shift = getShiftById(id);
        shift.setBasePrice(java.math.BigDecimal.valueOf(price));
        return shiftRepository.save(shift);
    }

    @Transactional
    public void deleteShift(Long id) {
        shiftRepository.deleteById(id);
    }
}
