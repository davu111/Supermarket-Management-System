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
public class TopProduct {
    private String productName;
    private Long totalQuantity;
    private BigDecimal totalRevenue;
}
