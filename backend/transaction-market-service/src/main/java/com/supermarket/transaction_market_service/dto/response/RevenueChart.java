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
public class RevenueChart {
    private String period; // "Day 1", "Day 2" hoặc "Jan", "Feb"
    private BigDecimal revenue;
}
