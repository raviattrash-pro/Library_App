package com.library.library.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "print_settings")
public class PrintSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double blackAndWhiteCost;
    private Double colorCost;
}
