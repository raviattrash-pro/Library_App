package com.library.library.repository;

import com.library.library.model.PrintSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintSettingsRepository extends JpaRepository<PrintSettings, Long> {
}
