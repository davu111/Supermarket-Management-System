package com.supermarket.transaction_market_service.dto.request;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class TransactionRequest {
    List<Item> items;
    BigDecimal total;
    String paymentMethod;
    String cardNumber;
}
