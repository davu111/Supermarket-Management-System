package com.supermarket.transaction_market_service.dto.response;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class TransactionItemResponse {
    Long id;
    Long transactionId;
    String productId;
    String productName;
    Integer quantity;
    BigDecimal priceAtTime;
}
