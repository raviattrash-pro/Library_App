package com.library.library.repository;

import com.library.library.model.Expenditure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenditureRepository extends JpaRepository<Expenditure, Long> {

    @Query("SELECT SUM(e.amount) FROM Expenditure e")
    Double sumTotalExpenditure();
}
