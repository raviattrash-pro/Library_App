package com.library.library.controller;

import com.library.library.model.LostItem;
import com.library.library.service.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lost-found")

public class LostItemController {

    @Autowired
    private LostItemService service;

    private final Path fileStorageLocation = Paths.get("uploads/lostfound").toAbsolutePath().normalize();

    public LostItemController() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<LostItem> addItem(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam(value = "dateFound", required = false) String dateFoundStr,
            @RequestParam(value = "image", required = false) MultipartFile file) {

        LostItem item = new LostItem();
        item.setTitle(title);
        item.setDescription(description);
        item.setFoundLocation(location);
        if (dateFoundStr != null && !dateFoundStr.isEmpty()) {
            item.setDateFound(LocalDate.parse(dateFoundStr));
        }

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                item.setImageUrl("/uploads/lostfound/" + fileName);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }

        return ResponseEntity.ok(service.addItem(item));
    }

    @GetMapping
    public ResponseEntity<List<LostItem>> getAllItems() {
        return ResponseEntity.ok(service.getAllItems());
    }

    @GetMapping("/found")
    public ResponseEntity<List<LostItem>> getFoundItems() {
        return ResponseEntity.ok(service.getItemsByStatus("Found"));
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<LostItem> markClaimed(@PathVariable Long id) {
        LostItem item = service.markAsClaimed(id);
        if (item != null) {
            return ResponseEntity.ok(item);
        }
        return ResponseEntity.notFound().build();
    }
}
