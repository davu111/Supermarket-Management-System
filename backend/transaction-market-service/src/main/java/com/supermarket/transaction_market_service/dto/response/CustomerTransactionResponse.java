package com.supermarket.transaction_market_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CustomerTransactionResponse {
    private Long customerId;
    private List<TransactionResponse> transactions;
}
