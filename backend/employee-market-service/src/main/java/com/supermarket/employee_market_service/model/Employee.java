package com.supermarket.employee_market_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Employee {
    String id;
    String name;
    String email;
    String role; // CASHIER, WAREHOUSE, MARKETING, ADMIN
    boolean enabled;
}
