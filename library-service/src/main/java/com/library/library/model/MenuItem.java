package com.library.library.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "menu_items")
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type; // "Snack", "Beverage", "Stationery", "Meal"
    private Double price;

    @Column(length = 1000000) // Increase column length for Base64 images
    private String imageUrl;

    private boolean available = true;
}
