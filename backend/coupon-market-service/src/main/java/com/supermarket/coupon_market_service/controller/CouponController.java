package com.supermarket.coupon_market_service.controller;

import com.supermarket.coupon_market_service.dto.request.ApplyCouponRequest;
import com.supermarket.coupon_market_service.dto.response.ApplyCouponResponse;
import com.supermarket.coupon_market_service.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/apply")
    public ResponseEntity<ApplyCouponResponse> applyCoupons(
            @RequestBody ApplyCouponRequest request) {
        ApplyCouponResponse response = couponService.applyCoupons(request);
        return ResponseEntity.ok(response);
    }
}
