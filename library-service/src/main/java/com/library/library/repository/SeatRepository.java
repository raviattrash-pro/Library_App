package com.library.library.repository;

import com.library.library.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    Optional<Seat> findBySeatNumber(String seatNumber);

    List<Seat> findByStatus(Seat.SeatStatus status);

    List<Seat> findByIsActiveTrue();
}
