package com.supermarket.coupon_market_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CouponDetail {
    private String type;
    private String name;
    private BigDecimal amount;
    private String description;
    private List<String> appliedProductCodes; // Dành cho PRODUCT type
}
