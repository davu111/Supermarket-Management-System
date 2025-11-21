package com.supermarket.employee_market_service.exception;

public class PasswordResetException extends EmployeeServiceException {
    public PasswordResetException(String message) {
        super("Không thể reset mật khẩu: " + message);
    }
}
