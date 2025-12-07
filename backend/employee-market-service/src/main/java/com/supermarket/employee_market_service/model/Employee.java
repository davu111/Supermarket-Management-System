package com.supermarket.employee_market_service.model;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Employee extends User{
    String name;
    String role; // CASHIER, WAREHOUSE, MARKETING, ADMIN
    boolean enabled;

    public Employee(String id, String name, String email, String role, Boolean enabled) {
        super.setEmail(email);
        super.setId(id);
        this.name = name;
        this.role = role;
        this.enabled = enabled;
    }
}
