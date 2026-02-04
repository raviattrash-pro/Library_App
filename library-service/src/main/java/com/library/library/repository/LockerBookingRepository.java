package com.library.library.repository;

import com.library.library.model.LockerBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LockerBookingRepository extends JpaRepository<LockerBooking, Long> {
    List<LockerBooking> findByUserId(Long userId);

    List<LockerBooking> findByLockerId(Long lockerId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(lb.amount) FROM LockerBooking lb WHERE lb.status = :status")
    Double sumAmountByStatus(
            @org.springframework.data.repository.query.Param("status") LockerBooking.LockerBookingStatus status);
}
