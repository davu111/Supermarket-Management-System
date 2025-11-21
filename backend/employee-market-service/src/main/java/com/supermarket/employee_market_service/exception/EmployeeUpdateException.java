package com.supermarket.employee_market_service.exception;

public class EmployeeUpdateException extends EmployeeServiceException {
    public EmployeeUpdateException(String message) {
        super("Không thể cập nhật nhân viên: " + message);
    }
}
