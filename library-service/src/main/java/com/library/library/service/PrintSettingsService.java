package com.library.library.service;

import com.library.library.model.PrintSettings;
import com.library.library.repository.PrintSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PrintSettingsService {

    @Autowired
    private PrintSettingsRepository repository;

    public PrintSettings getSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            PrintSettings settings = new PrintSettings();
            settings.setBlackAndWhiteCost(2.0);
            settings.setColorCost(10.0);
            return repository.save(settings);
        });
    }

    public PrintSettings updateSettings(Double blackAndWhiteCost, Double colorCost) {
        PrintSettings settings = getSettings();
        if (blackAndWhiteCost != null)
            settings.setBlackAndWhiteCost(blackAndWhiteCost);
        if (colorCost != null)
            settings.setColorCost(colorCost);
        return repository.save(settings);
    }
}
