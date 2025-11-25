package com.supermarket.coupon_market_service.dto.request;

import com.supermarket.coupon_market_service.model.CouponType;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CouponRequest {
    CouponType type; // COMBO, TOTAL, HOLIDAY, PRODUCT
    String name;
    String description;
    BigDecimal amount; // Số tiền giảm giá
    BigDecimal percentageDiscount; // % giảm giá (nếu có)
    String comboProductCodes; // JSON array hoặc comma-separated: ["SUAXXX","BMIXXX"]
    BigDecimal minOrderAmount; // Tổng đơn hàng tối thiểu
    String holidayCode; // TET, NOEL, etc.

    LocalDateTime holidayStartDate;
    LocalDateTime holidayEndDate;

    String applicableProductCodes; // JSON array hoặc comma-separated

    String productCodePattern; // Regex pattern: "SUA.*", "BMI.*"

    Boolean isActive = true;
    LocalDateTime startDate;
    LocalDateTime endDate;
    Integer priority = 0; // Độ ưu tiên (số càng cao càng ưu tiên)

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
