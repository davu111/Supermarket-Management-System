package com.supermarket.coupon_market_service.mapper;

import com.supermarket.coupon_market_service.dto.request.CouponRequest;
import com.supermarket.coupon_market_service.dto.response.CouponResponse;
import com.supermarket.coupon_market_service.model.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CouponMapper {
    Coupon toCoupon(CouponRequest request);
    CouponResponse toCouponResponse(Coupon coupon);
    void updateCouponFromRequest(CouponRequest request, @MappingTarget Coupon coupon);
}
