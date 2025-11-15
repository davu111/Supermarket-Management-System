package com.transportation.inventory.dto.response;

import com.transportation.inventory.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class InventoryTransactionResponse {
    String warehouseId;
    String deliveryPointId;
    String orderId;
    String productId;
    Double quantity;
    TransactionType type;
}
