package com.supermarket.transaction_market_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Summary {
    private BigDecimal totalRevenue;
    private Long totalTransactions;
    private Long totalProducts;
    private BigDecimal averageOrderValue;
}
