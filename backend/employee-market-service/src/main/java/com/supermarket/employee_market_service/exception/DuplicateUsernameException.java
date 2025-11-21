package com.supermarket.employee_market_service.exception;

// Specific exceptions
public class DuplicateUsernameException extends EmployeeServiceException {
    public DuplicateUsernameException(String username) {
        super("Tên đăng nhập '" + username + "' đã tồn tại");
    }
}
