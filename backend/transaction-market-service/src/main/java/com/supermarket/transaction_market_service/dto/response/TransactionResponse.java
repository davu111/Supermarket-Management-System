package com.supermarket.transaction_market_service.dto.response;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class TransactionResponse {
    Long id;
    Long customerId;
    BigDecimal total;
    String paymentMethod;
    String createdAt;
    List<TransactionItemResponse> items;
}
