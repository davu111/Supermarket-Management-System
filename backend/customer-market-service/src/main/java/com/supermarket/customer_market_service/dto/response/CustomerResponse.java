package com.supermarket.customer_market_service.dto.response;

import com.supermarket.customer_market_service.model.Gender;
import com.supermarket.customer_market_service.model.MembershipTier;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;

    private String fullName;
    private String email;
    private String cardNumber;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Integer points = 0;
    private MembershipTier membershipTier;
    private Boolean active = true;
}
