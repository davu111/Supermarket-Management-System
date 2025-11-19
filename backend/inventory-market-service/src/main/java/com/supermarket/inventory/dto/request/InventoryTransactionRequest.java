package com.supermarket.inventory.dto.request;

import com.supermarket.inventory.enums.TransactionType;
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
public class InventoryTransactionRequest {
    String orderId;
    String productId;
    Double quantity;
    TransactionType type;
}
