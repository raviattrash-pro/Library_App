package com.library.library.service;

import com.library.library.model.LostItem;
import com.library.library.repository.LostItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LostItemService {

    @Autowired
    private LostItemRepository repository;

    public LostItem addItem(LostItem item) {
        return repository.save(item);
    }

    public List<LostItem> getAllItems() {
        return repository.findAll();
    }

    public List<LostItem> getItemsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public LostItem markAsClaimed(Long id) {
        Optional<LostItem> itemOpt = repository.findById(id);
        if (itemOpt.isPresent()) {
            LostItem item = itemOpt.get();
            item.setStatus("Claimed");
            return repository.save(item);
        }
        return null;
    }
}
