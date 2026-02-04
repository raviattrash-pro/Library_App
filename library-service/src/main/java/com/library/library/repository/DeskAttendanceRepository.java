package com.library.library.repository;

import com.library.library.model.DeskAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeskAttendanceRepository extends JpaRepository<DeskAttendance, Long> {
    List<DeskAttendance> findByUserId(Long userId);

    Optional<DeskAttendance> findByUserIdAndCheckOutTimeIsNull(Long userId);

    List<DeskAttendance> findByUserIdAndCheckInTimeAfter(Long userId, java.time.LocalDateTime checkInTime);
}
