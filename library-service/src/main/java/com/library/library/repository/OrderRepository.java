package com.library.library.repository;

import com.library.library.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN :statuses")
    Double sumTotalAmountByStatusIn(
            @org.springframework.data.repository.query.Param("statuses") java.util.List<String> statuses);
}
