package com.library.library.service;

import com.library.library.model.Locker;
import com.library.library.model.LockerBooking;
import com.library.library.repository.LockerBookingRepository;
import com.library.library.repository.LockerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LockerService {

    @Autowired
    private LockerRepository lockerRepository;

    @Autowired
    private LockerBookingRepository lockerBookingRepository;

    @Autowired
    private com.library.library.repository.SeatRepository seatRepository;

    public List<Locker> getAllLockers() {
        syncLockersWithSeats();
        List<Locker> lockers = lockerRepository.findAll();
        List<LockerBooking> activeBookings = lockerBookingRepository.findAll();

        for (Locker locker : lockers) {
            if (locker.getStatus() == Locker.LockerStatus.BOOKED) {
                // Find active or pending booking for this locker
                activeBookings.stream()
                        .filter(b -> b.getLocker().getId().equals(locker.getId()) &&
                                (b.getStatus() == LockerBooking.LockerBookingStatus.ACTIVE ||
                                        b.getStatus() == LockerBooking.LockerBookingStatus.PENDING))
                        .findFirst()
                        .ifPresent(booking -> locker.setBookedBy("User " + booking.getUserId()));
            }
        }
        return lockers;
    }

    // Auto-create lockers if they don't exist
    // Wrapped in try-catch to prevent startup crashes if SeatRepository is not
    // ready
    public void syncLockersWithSeats() {
        try {
            long seatCount = seatRepository.count();
            long lockerCount = lockerRepository.count();

            if (lockerCount < seatCount) {
                for (int i = (int) lockerCount + 1; i <= seatCount; i++) {
                    Locker locker = new Locker();
                    locker.setLockerNumber("L" + i);
                    locker.setPrice(500.0); // Default price
                    locker.setStatus(Locker.LockerStatus.AVAILABLE);
                    locker.setIsActive(true);
                    lockerRepository.save(locker);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to sync lockers with seats. Proceeding with existing lockers. Error: "
                    + e.getMessage());
        }
    }

    public Locker createLocker(Locker locker) {
        return lockerRepository.save(locker);
    }

    public LockerBooking bookLocker(Long userId, Long lockerId, int durationMonths, String screenshotBase64) {
        Locker locker = lockerRepository.findById(lockerId)
                .orElseThrow(() -> new RuntimeException("Locker not found"));

        if (locker.getStatus() != Locker.LockerStatus.AVAILABLE) {
            throw new RuntimeException("Locker is not available");
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(durationMonths);
        Double amount = locker.getPrice() * durationMonths;

        LockerBooking booking = new LockerBooking(userId, locker, startDate, endDate, amount);
        booking.setStatus(LockerBooking.LockerBookingStatus.PENDING); // Pending admin approval
        booking.setPaymentScreenshot(screenshotBase64);

        locker.setStatus(Locker.LockerStatus.BOOKED);
        lockerRepository.save(locker);

        return lockerBookingRepository.save(booking);
    }

    public LockerBooking verifyBooking(Long bookingId, boolean isApproved) {
        LockerBooking booking = lockerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Locker locker = booking.getLocker();

        if (isApproved) {
            booking.setStatus(LockerBooking.LockerBookingStatus.ACTIVE);
            // Locker is already BOOKED from the initial request
        } else {
            booking.setStatus(LockerBooking.LockerBookingStatus.CANCELLED);
            // Revert locker status
            locker.setStatus(Locker.LockerStatus.AVAILABLE);
            lockerRepository.save(locker);
        }
        return lockerBookingRepository.save(booking);
    }

    public LockerBooking cancelBooking(Long bookingId) {
        LockerBooking booking = lockerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Locker locker = booking.getLocker();

        booking.setStatus(LockerBooking.LockerBookingStatus.CANCELLED);
        locker.setStatus(Locker.LockerStatus.AVAILABLE);

        lockerRepository.save(locker);
        return lockerBookingRepository.save(booking);
    }

    public List<LockerBooking> getUserBookings(Long userId) {
        return lockerBookingRepository.findByUserId(userId);
    }

    public List<LockerBooking> getAllBookings() {
        return lockerBookingRepository.findAll();
    }

    public Locker updateLockerPrice(Long id, Double newPrice) {
        Locker locker = lockerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locker not found"));
        locker.setPrice(newPrice);
        return lockerRepository.save(locker);
    }
}
