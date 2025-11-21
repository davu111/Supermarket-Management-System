package com.supermarket.employee_market_service.exception;

public class DuplicateEmailException extends EmployeeServiceException {
    public DuplicateEmailException(String email) {
        super("Email '" + email + "' đã được sử dụng");
    }
}
