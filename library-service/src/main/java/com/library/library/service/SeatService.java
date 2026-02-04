package com.library.library.service;

import com.library.library.model.Seat;
import com.library.library.model.Seat.SeatStatus;
import com.library.library.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @Transactional(readOnly = true)
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Seat getSeatById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
    }

    @Transactional(readOnly = true)
    public List<Seat> getAvailableSeats() {
        return seatRepository.findByStatus(SeatStatus.AVAILABLE);
    }

    @Transactional
    public Seat createSeat(Seat seat) {
        return seatRepository.save(seat);
    }

    @Transactional
    public Seat updateSeat(Long id, Seat updatedSeat) {
        Seat seat = getSeatById(id);
        if (updatedSeat.getSeatNumber() != null)
            seat.setSeatNumber(updatedSeat.getSeatNumber());
        if (updatedSeat.getStatus() != null)
            seat.setStatus(updatedSeat.getStatus());
        if (updatedSeat.getRowNumber() != null)
            seat.setRowNumber(updatedSeat.getRowNumber());
        if (updatedSeat.getColumnNumber() != null)
            seat.setColumnNumber(updatedSeat.getColumnNumber());
        if (updatedSeat.getSection() != null)
            seat.setSection(updatedSeat.getSection());
        if (updatedSeat.getIsActive() != null)
            seat.setIsActive(updatedSeat.getIsActive());
        return seatRepository.save(seat);
    }

    @Transactional
    public void deleteSeat(Long id) {
        seatRepository.deleteById(id);
    }

    @Transactional
    public Seat updateSeatStatus(Long id, SeatStatus status) {
        Seat seat = getSeatById(id);
        seat.setStatus(status);
        return seatRepository.save(seat);
    }

    @Transactional
    public void deleteAllSeats() {
        seatRepository.deleteAll();
    }

    public long count() {
        return seatRepository.count();
    }
}
