package com.supermarket.coupon_market_service.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ApplyCouponRequest {
    private List<String> productIds;
    private BigDecimal totalAmount; // Optional - có thể tính trong backend
    private String cardNumber;
}
