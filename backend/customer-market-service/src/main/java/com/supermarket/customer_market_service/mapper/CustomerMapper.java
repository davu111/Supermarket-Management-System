package com.supermarket.customer_market_service.mapper;

import com.supermarket.customer_market_service.dto.request.CustomerRequest;
import com.supermarket.customer_market_service.dto.response.CustomerResponse;
import com.supermarket.customer_market_service.model.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    @Mapping(target = "membershipTier", expression = "java(mapTier(customer.getTierPoints()))")
    CustomerResponse toCustomerResponse(Customer customer);

    @Mapping(target = "cardNumber", expression = "java(generateCardNumberWithPrefix(request))")
    Customer toCustomer(CustomerRequest request);

    @Mapping(target = "cardNumber", expression = "java(generateCardNumberWithPrefix(request))")
    void updateCustomerFromRequest(CustomerRequest request, @MappingTarget Customer customer);

    default String mapTier(Integer tierPoints) {
        if (tierPoints == null) return "COPPER";

        if (tierPoints >= 500) return "DIAMOND";
        else if (tierPoints >= 400) return "PLATINUM";
        else if (tierPoints >= 300) return "GOLD";
        else if (tierPoints >= 200) return "SILVER";
        else return "COPPER";
    }

    default String getTierPrefix(Integer tierPoints) {
        String tier = mapTier(tierPoints);
        return switch (tier) {
            case "DIAMOND" -> "D";
            case "PLATINUM" -> "P";
            case "GOLD" -> "G";
            case "SILVER" -> "S";
            default -> "C";
        };
    }

    default String generateCardNumberWithPrefix(CustomerRequest request) {
        String cardNumber = request.getCardNumber();
        Integer tierPoints = request.getTierPoints();

        if (cardNumber == null) return null;

        // Remove existing prefix nếu có
        if (cardNumber.matches("^[DPGSC]CARD.*")) {
            cardNumber = cardNumber.substring(1);
        }

        // Add tier prefix
        String prefix = getTierPrefix(tierPoints);
        return prefix + cardNumber;
    }
}
