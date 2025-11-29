package com.supermarket.transaction_market_service.repository;

import com.supermarket.transaction_market_service.model.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionItemRepository extends JpaRepository<TransactionItem, Long> {
}
