package com.supermarket.customer_market_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)  // Include parent fields trong equals/hashCode
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends User{
    private String fullName;
    private String cardNumber;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private LocalDate dateOfBirth;
    private Integer rewardPoints = 0;
    private Integer tierPoints = 0;
    private Boolean active = true;
}
