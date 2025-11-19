package com.transportation.inventory.repository;

import com.transportation.inventory.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByWarehouseIdOrderByCreatedAtDesc(String warehouseId);
}
