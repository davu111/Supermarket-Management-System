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
    List<Inventory> findBySourceId(String sourceId);
    List<Inventory> findBySourceType(SourceType sourceType);
    Optional<Inventory> findBySourceIdAndProductId(String sourceId, String productId);
    Optional<Inventory> findBySourceTypeAndProductId(SourceType sourceType, String productId);

    @Modifying
    @Query("DELETE FROM Inventory i WHERE i.sourceId = :sourceId AND i.productId IN :productIds")
    void deleteByProductIdInAndSourceId(List<String> productIds, String sourceId);

    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = :quantity WHERE i.productId = :productId AND i.sourceId = :sourceId")
    void updateQuantityByProductIdAndSourceId(@Param("sourceId") String sourceId,
                                              @Param("productId") String productId,
                                              @Param("quantity") Double quantity);

    void deleteByProductIdAndSourceId(String productId, String sourceId);

}
