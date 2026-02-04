package com.library.library.service;

import com.library.library.model.MenuItem;
import com.library.library.model.Order;
import com.library.library.repository.MenuItemRepository;
import com.library.library.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderingService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Menu Operations
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue();
    }

    public MenuItem addMenuItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    public MenuItem updateMenuItemAvailability(Long id, boolean available) {
        Optional<MenuItem> item = menuItemRepository.findById(id);
        if (item.isPresent()) {
            MenuItem menuItem = item.get();
            menuItem.setAvailable(available);
            return menuItemRepository.save(menuItem);
        }
        return null;
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedItem) {
        Optional<MenuItem> item = menuItemRepository.findById(id);
        if (item.isPresent()) {
            MenuItem menuItem = item.get();
            menuItem.setName(updatedItem.getName());
            menuItem.setPrice(updatedItem.getPrice());
            menuItem.setType(updatedItem.getType());
            menuItem.setImageUrl(updatedItem.getImageUrl());
            return menuItemRepository.save(menuItem);
        }
        return null;
    }

    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    // Order Operations
    public Order placeOrder(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }
}
