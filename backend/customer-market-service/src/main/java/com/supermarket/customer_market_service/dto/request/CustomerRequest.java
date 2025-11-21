package com.supermarket.customer_market_service.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mã số thẻ không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9]{6}$", message = "Mã số thẻ phải có đúng 6 ký tự")
    private String cardNumber;

    @NotNull(message = "Giới tính không được để trống")
    private String gender;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate dateOfBirth;

    @NotNull(message = "Điểm không được để trống")
    @Min(value = 0, message = "Điểm không được âm")
    private Integer points;

    @NotNull(message = "Cấp bậc hội viên không được để trống")
    private String membershipTier;
}
