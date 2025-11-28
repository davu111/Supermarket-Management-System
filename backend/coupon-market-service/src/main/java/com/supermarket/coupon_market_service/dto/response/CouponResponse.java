package com.supermarket.coupon_market_service.dto.response;

import com.supermarket.coupon_market_service.model.CouponType;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CouponResponse {
    Long id;
    CouponType type; // COMBO, TOTAL, HOLIDAY, PRODUCT
    String name;
    String description;
    BigDecimal amount; // Số tiền giảm giá
    BigDecimal percentageDiscount; // % giảm giá (nếu có)
    String comboProductCodes; // JSON array hoặc comma-separated: ["SUAXXX","BMIXXX"]
    BigDecimal minOrderAmount; // Tổng đơn hàng tối thiểu
    String holidayCode; // TET, NOEL, etc.

    LocalDate holidayStartDate;
    LocalDate holidayEndDate;

    String applicableProductCodes; // JSON array hoặc comma-separated

    String productCodePattern; // Regex pattern: "SUA.*", "BMI.*"
    String cardPattern;  // Lưu dạng JSON array: ["GCARD*"]

    Boolean isActive = true;
    LocalDate startDate;
    LocalDate endDate;
    Integer priority = 0; // Độ ưu tiên (số càng cao càng ưu tiên)

    LocalDate createdAt;
    LocalDate updatedAt;
}
