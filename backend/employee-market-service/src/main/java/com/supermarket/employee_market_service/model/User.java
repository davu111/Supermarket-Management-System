package com.supermarket.customer_market_service.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@MappedSuperclass  // Không tạo table riêng cho User
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;
}
