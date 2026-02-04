package com.library.library.service;

import com.library.library.model.DeskAttendance;
import com.library.library.repository.DeskAttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DeskAttendanceService {

    @Autowired
    private DeskAttendanceRepository repository;

    public DeskAttendance checkIn(Long userId, String seatId) {
        // Check if already checked in
        Optional<DeskAttendance> existing = repository.findByUserIdAndCheckOutTimeIsNull(userId);
        if (existing.isPresent()) {
            throw new RuntimeException("User already checked in");
        }

        DeskAttendance attendance = new DeskAttendance();
        attendance.setUserId(userId);
        attendance.setSeatId(seatId);
        attendance.setCheckInTime(LocalDateTime.now());
        return repository.save(attendance);
    }

    public DeskAttendance checkOut(Long userId) {
        Optional<DeskAttendance> existing = repository.findByUserIdAndCheckOutTimeIsNull(userId);
        if (existing.isPresent()) {
            DeskAttendance attendance = existing.get();
            attendance.setCheckOutTime(LocalDateTime.now());
            return repository.save(attendance);
        }
        throw new RuntimeException("User not checked in");
    }

    public DeskAttendance getCurrentSession(Long userId) {
        return repository.findByUserIdAndCheckOutTimeIsNull(userId).orElse(null);
    }

    public long getTodayStudyMinutes(Long userId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        java.util.List<DeskAttendance> todaySessions = repository.findByUserIdAndCheckInTimeAfter(userId, startOfDay);

        long totalMinutes = 0;
        for (DeskAttendance session : todaySessions) {
            LocalDateTime end = session.getCheckOutTime();
            if (end == null)
                end = LocalDateTime.now(); // Active session

            long minutes = java.time.Duration.between(session.getCheckInTime(), end).toMinutes();
            totalMinutes += minutes;
        }
        return totalMinutes;
    }
}
