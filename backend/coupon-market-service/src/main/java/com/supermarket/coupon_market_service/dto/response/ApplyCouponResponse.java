package com.supermarket.coupon_market_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ApplyCouponResponse {
    private List<CouponDetail> coupons;
    private BigDecimal totalDiscount;
    private BigDecimal originalTotal;
    private BigDecimal finalTotal;
}

