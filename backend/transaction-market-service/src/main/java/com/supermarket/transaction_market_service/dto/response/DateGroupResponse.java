package com.supermarket.transaction_market_service.dto.response;

import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class DateGroupResponse {
    String date;
    List<CustomerTransactionResponse> customers;
}
