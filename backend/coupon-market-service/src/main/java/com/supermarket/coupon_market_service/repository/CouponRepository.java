package com.supermarket.coupon_market_service.repository;

import com.supermarket.coupon_market_service.model.Coupon;
import com.supermarket.coupon_market_service.model.CouponType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
            "AND (c.startDate IS NULL OR c.startDate <= :now) " +
            "AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Coupon> findAllActiveCoupons(LocalDate now);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
            "AND c.type = :type " +
            "AND (c.startDate IS NULL OR c.startDate <= :now) " +
            "AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Coupon> findActiveCouponsByType(CouponType type, LocalDate now);
}
