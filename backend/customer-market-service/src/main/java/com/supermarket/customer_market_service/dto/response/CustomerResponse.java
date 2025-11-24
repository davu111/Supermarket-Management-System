package com.supermarket.customer_market_service.dto.response;

import com.supermarket.customer_market_service.model.Gender;
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
    private Integer rewardPoints = 0;
    private Integer tierPoints = 0;
    private Boolean active = true;
    private String membershipTier;
}
