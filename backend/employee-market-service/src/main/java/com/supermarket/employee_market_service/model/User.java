package com.supermarket.employee_market_service.model;


import lombok.Data;

@Data
public abstract class User {
    private String id;
    private String email;
}
