package com.supermarket.coupon_market_service.controller;

import com.supermarket.coupon_market_service.dto.request.ApplyCouponRequest;
import com.supermarket.coupon_market_service.dto.request.CouponRequest;
import com.supermarket.coupon_market_service.dto.response.ApplyCouponResponse;
import com.supermarket.coupon_market_service.dto.response.CouponResponse;
import com.supermarket.coupon_market_service.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/getAll")
    public List<CouponResponse> getAllCoupons() {
        return couponService.getAllCoupons();
    }

    @PostMapping("/create")
    public ResponseEntity<CouponResponse> createCoupon(@RequestBody CouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @RequestBody CouponRequest request) {
        CouponResponse response = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/apply")
    public ResponseEntity<ApplyCouponResponse> applyCoupons(
            @RequestBody ApplyCouponRequest request) {
        ApplyCouponResponse response = couponService.applyCoupons(request);
        return ResponseEntity.ok(response);
    }
}
