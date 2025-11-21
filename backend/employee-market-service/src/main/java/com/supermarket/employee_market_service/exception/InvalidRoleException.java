package com.supermarket.employee_market_service.exception;

public class InvalidRoleException extends EmployeeServiceException {
    public InvalidRoleException(String role) {
        super("Chức vụ không hợp lệ: " + role);
    }
}
