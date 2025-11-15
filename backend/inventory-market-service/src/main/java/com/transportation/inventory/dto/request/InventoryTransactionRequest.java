package com.transportation.inventory.dto.request;

import com.transportation.inventory.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class InventoryTransactionRequest {
    String warehouseId;
    String deliveryPointId;
    String orderId;
    String productId;
    Double quantity;
    TransactionType type;
}
