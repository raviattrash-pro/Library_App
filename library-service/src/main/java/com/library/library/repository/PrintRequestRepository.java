package com.library.library.repository;

import com.library.library.model.PrintRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrintRequestRepository extends JpaRepository<PrintRequest, Long> {
    List<PrintRequest> findByUserId(Long userId);

    List<PrintRequest> findByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(pr.resultCost) FROM PrintRequest pr WHERE pr.status IN :statuses")
    Double sumResultCostByStatusIn(
            @org.springframework.data.repository.query.Param("statuses") java.util.List<String> statuses);
}
