package com.supermarket.transaction_market_service.dto.request;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Item {
    String id;
    String code;
    String name;
    BigDecimal price;
    Integer quantity;
}
