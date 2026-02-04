package com.library.booking.service;

import com.library.booking.client.LibraryClient;
import com.library.booking.model.Booking;
import com.library.booking.model.Booking.BookingStatus;
import com.library.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final LibraryClient libraryClient;

    public BookingService(BookingRepository bookingRepository, LibraryClient libraryClient) {
        this.bookingRepository = bookingRepository;
        this.libraryClient = libraryClient;
    }

    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PAYMENT_SUBMITTED);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        // Check if seat is already booked for this shift
        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING,
                BookingStatus.PAYMENT_SUBMITTED,
                BookingStatus.CONFIRMED);

        Optional<Booking> existingBooking = bookingRepository.findBySeatIdAndShiftIdAndStatusIn(
                booking.getSeatId(),
                booking.getShiftId(),
                activeStatuses);

        if (existingBooking.isPresent()) {
            throw new RuntimeException(
                    "Seat is already booked for this shift. Please select a different seat or shift.");
        }

        // Keep status as provided (PAYMENT_SUBMITTED) - admin will verify
        Booking savedBooking = bookingRepository.save(booking);

        // Update seat status to BOOKED pending verification, or we can keep it
        // available until payment?
        // Usually we reserve it. Let's mark it as BOOKED to prevent others from taking
        // it.
        updateSeatStatusSafely(booking.getSeatId(), "BOOKED");

        return savedBooking;
    }

    @Transactional
    public Booking updateBooking(Long id, Booking updatedBooking) {
        Booking booking = getBookingById(id);
        if (updatedBooking.getStatus() != null)
            booking.setStatus(updatedBooking.getStatus());
        return bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        // Free up the seat
        updateSeatStatusSafely(booking.getSeatId(), "AVAILABLE");
        bookingRepository.deleteById(id);
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        // Free up the seat
        updateSeatStatusSafely(booking.getSeatId(), "AVAILABLE");
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking verifyPayment(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PAYMENT_SUBMITTED) {
            throw new RuntimeException("Booking is not pending payment verification");
        }
        booking.setStatus(BookingStatus.CONFIRMED);

        // Ensure seat is definitely booked
        updateSeatStatusSafely(booking.getSeatId(), "BOOKED");

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking rejectPayment(Long id, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PAYMENT_SUBMITTED) {
            throw new RuntimeException("Booking is not pending payment verification");
        }
        booking.setStatus(BookingStatus.CANCELLED);

        // Free up the seat
        updateSeatStatusSafely(booking.getSeatId(), "AVAILABLE");

        // Optionally store reason in a notes field if available
        return bookingRepository.save(booking);
    }

    private void updateSeatStatusSafely(Long seatId, String status) {
        try {
            System.out.println("Attempting to update seat " + seatId + " status to " + status);
            libraryClient.updateSeatStatus(seatId, status);
            System.out.println("Successfully updated seat " + seatId + " status to " + status);
        } catch (Exception e) {
            System.err.println("Failed to update seat status. SeatId: " + seatId + ", Status: " + status);
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal calculateTotalRevenue() {
        return bookingRepository.sumTotalAmountByStatus(BookingStatus.CONFIRMED);
    }
}
