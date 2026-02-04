package com.library.booking.repository;

import com.library.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    List<Booking> findBySeatId(Long seatId);

    List<Booking> findByStatus(Booking.BookingStatus status);

    List<Booking> findByBookingDateBetween(LocalDate start, LocalDate end);

    // Check if seat is already booked for a specific shift (prevents duplicate
    // bookings)
    Optional<Booking> findBySeatIdAndShiftIdAndStatusIn(Long seatId, Long shiftId,
            List<Booking.BookingStatus> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.status = :status")
    java.math.BigDecimal sumTotalAmountByStatus(@org.springframework.data.repository.query.Param("status") Booking.BookingStatus status);
}
