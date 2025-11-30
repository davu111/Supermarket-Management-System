package com.supermarket.transaction_market_service.repository;

import com.supermarket.transaction_market_service.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    List<Transaction> findByCreatedAtBetween(LocalDate startDate, LocalDate endDate);
}
