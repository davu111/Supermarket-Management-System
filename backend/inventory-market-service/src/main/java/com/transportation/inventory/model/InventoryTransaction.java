package com.transportation.inventory.model;

import com.transportation.inventory.enums.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class InventoryTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String warehouseId;
    String deliveryPointId;
    String orderId;
    String productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    TransactionType type;

    private Double quantity;
    private LocalDateTime createdAt;

    public void setTransactionType(TransactionType type) {
        this.type = type;
    }
}

