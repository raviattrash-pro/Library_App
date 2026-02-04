package com.library.library.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lockers")
public class Locker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String lockerNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LockerStatus status = LockerStatus.AVAILABLE;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Transient
    private String bookedBy;

    public enum LockerStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE
    }

    // Constructors
    public Locker() {
    }

    public Locker(String lockerNumber, Double price) {
        this.lockerNumber = lockerNumber;
        this.price = price;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLockerNumber() {
        return lockerNumber;
    }

    public void setLockerNumber(String lockerNumber) {
        this.lockerNumber = lockerNumber;
    }

    public LockerStatus getStatus() {
        return status;
    }

    public void setStatus(LockerStatus status) {
        this.status = status;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getBookedBy() {
        return bookedBy;
    }

    public void setBookedBy(String bookedBy) {
        this.bookedBy = bookedBy;
    }
}
