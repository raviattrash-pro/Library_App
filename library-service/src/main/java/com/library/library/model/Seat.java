package com.library.library.model;

import jakarta.persistence.*;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Column(name = "`row_number`")
    private Integer rowNumber;

    @Column(name = "`column_number`")
    private Integer columnNumber;
    private String section;

    @Column(nullable = false)
    private Boolean isActive = true;

    public enum SeatStatus {
        AVAILABLE,
        BOOKED,
        HOLD,
        MAINTENANCE
    }

    // Constructors
    public Seat() {
    }

    public Seat(Long id, String seatNumber, SeatStatus status, Integer rowNumber,
            Integer columnNumber, String section, Boolean isActive) {
        this.id = id;
        this.seatNumber = seatNumber;
        this.status = status;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
        this.section = section;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public SeatStatus getStatus() {
        return status;
    }

    public void setStatus(SeatStatus status) {
        this.status = status;
    }

    public Integer getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(Integer rowNumber) {
        this.rowNumber = rowNumber;
    }

    public Integer getColumnNumber() {
        return columnNumber;
    }

    public void setColumnNumber(Integer columnNumber) {
        this.columnNumber = columnNumber;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
