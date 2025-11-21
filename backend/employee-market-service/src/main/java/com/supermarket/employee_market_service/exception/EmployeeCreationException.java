package com.supermarket.employee_market_service.exception;

public class EmployeeCreationException extends EmployeeServiceException {
    public EmployeeCreationException(String message) {
        super("Không thể tạo nhân viên: " + message);
    }
}
