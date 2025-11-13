package com.supermarket.coupon_market_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private CouponType type; // COMBO, TOTAL, HOLIDAY, PRODUCT
    private String name;
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount; // Số tiền giảm giá

    @Column(precision = 5, scale = 2)
    private BigDecimal percentageDiscount; // % giảm giá (nếu có)

    // Điều kiện áp dụng cho COMBO
    private String comboProductCodes; // JSON array hoặc comma-separated: ["SUAXXX","BMIXXX"]

    // Điều kiện áp dụng cho TOTAL
    private BigDecimal minOrderAmount; // Tổng đơn hàng tối thiểu

    // Điều kiện áp dụng cho HOLIDAY
    private String holidayCode; // TET, NOEL, etc.

    private LocalDateTime holidayStartDate;
    private LocalDateTime holidayEndDate;

    // Điều kiện áp dụng cho PRODUCT
    @Column(length = 1000)
    private String applicableProductCodes; // JSON array hoặc comma-separated

    @Column(length = 100)
    private String productCodePattern; // Regex pattern: "SUA.*", "BMI.*"

    // Metadata
    private Boolean isActive = true;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer priority = 0; // Độ ưu tiên (số càng cao càng ưu tiên)

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

