package com.library.library.config;

import com.library.library.model.Seat;
import com.library.library.model.Seat.SeatStatus;
import com.library.library.model.Shift;
import com.library.library.repository.SeatRepository;
import com.library.library.repository.ShiftRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Data Seeder - Seeds initial library data on startup
 * 
 * Room Layout:
 * - 8 Student Tables with 6 chairs each = 48 student seats
 * - 8 Teacher desks (4 corners + 4 mid-edges) = 8 teacher seats
 * - Total per room: 56 seats
 * - 5 Rooms (A, B, C, D, E) = 280 total seats
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final SeatRepository seatRepository;
    private final ShiftRepository shiftRepository;

    // Configuration
    private static final String[] SECTIONS = { "A", "B", "C", "D", "E" };
    private static final int STUDENT_TABLES = 8;
    private static final int CHAIRS_PER_TABLE = 6;
    private static final int TEACHER_SEATS = 8;

    public DataSeeder(SeatRepository seatRepository, ShiftRepository shiftRepository) {
        this.seatRepository = seatRepository;
        this.shiftRepository = shiftRepository;
    }

    @Override
    public void run(String... args) {
        seedShifts();
        seedSeats();
    }

    private void seedShifts() {
        if (shiftRepository.count() == 0) {
            log.info("Seeding shifts...");

            Shift morning = new Shift();
            morning.setName("Morning");
            morning.setStartTime(LocalTime.of(6, 0));
            morning.setEndTime(LocalTime.of(12, 0));
            morning.setBasePrice(new BigDecimal("50.00"));
            morning.setDescription("Early bird shift - 6 AM to 12 PM");
            shiftRepository.save(morning);

            Shift afternoon = new Shift();
            afternoon.setName("Afternoon");
            afternoon.setStartTime(LocalTime.of(12, 0));
            afternoon.setEndTime(LocalTime.of(18, 0));
            afternoon.setBasePrice(new BigDecimal("60.00"));
            afternoon.setDescription("Afternoon shift - 12 PM to 6 PM");
            shiftRepository.save(afternoon);

            Shift evening = new Shift();
            evening.setName("Evening");
            evening.setStartTime(LocalTime.of(18, 0));
            evening.setEndTime(LocalTime.of(23, 0));
            evening.setBasePrice(new BigDecimal("70.00"));
            evening.setDescription("Evening shift - 6 PM to 11 PM");
            shiftRepository.save(evening);

            Shift fullDay = new Shift();
            fullDay.setName("Full Day");
            fullDay.setStartTime(LocalTime.of(6, 0));
            fullDay.setEndTime(LocalTime.of(23, 0));
            fullDay.setBasePrice(new BigDecimal("150.00"));
            fullDay.setDescription("Full day access - 6 AM to 11 PM");
            shiftRepository.save(fullDay);

            log.info("✅ Seeded 4 shifts: Morning, Afternoon, Evening, Full Day");
        } else {
            log.info("Shifts already exist, skipping seed");
        }
    }

    private void seedSeats() {
        if (seatRepository.count() == 0) {
            log.info("Seeding library seats for room layout...");
            int totalSeats = 0;

            for (String section : SECTIONS) {
                // Seed Student Seats: 8 tables × 6 chairs = 48 seats
                // Naming: A1-1, A1-2, A1-3, A1-4, A1-5, A1-6 (Table 1, chairs 1-6)
                // A2-1, A2-2, ... A2-6 (Table 2, chairs 1-6)
                // etc.
                for (int table = 1; table <= STUDENT_TABLES; table++) {
                    for (int chair = 1; chair <= CHAIRS_PER_TABLE; chair++) {
                        Seat seat = new Seat();
                        seat.setSeatNumber(section + table + "-" + chair);
                        seat.setStatus(SeatStatus.AVAILABLE);
                        seat.setRowNumber(table <= 4 ? 1 : 2); // Row 1: Tables 1-4, Row 2: Tables 5-8
                        seat.setColumnNumber(table <= 4 ? table : table - 4); // Column within row
                        seat.setSection(section);
                        seat.setIsActive(true);
                        seatRepository.save(seat);
                        totalSeats++;
                    }
                }

                // Seed Teacher Seats: 8 seats (4 corners + 4 mid-edges)
                // Naming: AT-1 to AT-8 (Teacher seats)
                String[] teacherPositions = {
                        "T1-TL", // Top-Left Corner
                        "T2-TM", // Top-Middle
                        "T3-TR", // Top-Right Corner
                        "T4-ML", // Middle-Left
                        "T5-MR", // Middle-Right
                        "T6-BL", // Bottom-Left Corner
                        "T7-BM", // Bottom-Middle
                        "T8-BR" // Bottom-Right Corner
                };

                for (int i = 0; i < TEACHER_SEATS; i++) {
                    Seat teacherSeat = new Seat();
                    teacherSeat.setSeatNumber(section + teacherPositions[i]);
                    teacherSeat.setStatus(SeatStatus.AVAILABLE);
                    teacherSeat.setRowNumber(100 + i); // Use high row numbers for teachers
                    teacherSeat.setColumnNumber(i + 1);
                    teacherSeat.setSection(section);
                    teacherSeat.setIsActive(true);
                    seatRepository.save(teacherSeat);
                    totalSeats++;
                }

                log.info("✅ Seeded Room {}: 48 student seats + 8 teacher seats = 56 total", section);
            }

            log.info("✅ Total seats created: {} across 5 rooms", totalSeats);
        } else {
            log.info("Seats already exist ({} found), skipping seed", seatRepository.count());
        }
    }
}
