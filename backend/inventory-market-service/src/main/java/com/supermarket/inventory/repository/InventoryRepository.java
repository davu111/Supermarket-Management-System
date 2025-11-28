package com.supermarket.inventory.repository;

import com.supermarket.inventory.model.Inventory;
import com.supermarket.inventory.model.SourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    List<Inventory> findBySourceType(SourceType sourceType);
    Optional<Inventory> findBySourceTypeAndProductId(SourceType sourceType, String productId);
}
