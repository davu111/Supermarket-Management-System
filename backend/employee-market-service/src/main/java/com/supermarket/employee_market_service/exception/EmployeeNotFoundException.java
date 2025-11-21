package com.supermarket.employee_market_service.exception;

public class EmployeeNotFoundException extends EmployeeServiceException {
    public EmployeeNotFoundException(String userId) {
        super("Không tìm thấy nhân viên với ID: " + userId);
    }
}
