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
    CustomerResponse toCustomerResponse (Customer customer);
    Customer toCustomer (CustomerRequest request);
    void updateCustomerFromRequest(CustomerRequest request, @MappingTarget Customer customer);

    default String mapTier(Integer tierPoints) {
        if (tierPoints == null) return "BRONZE";

        if (tierPoints >= 500) return "DIAMOND";
        else if (tierPoints >= 400) return "PLATINUM";
        else if (tierPoints >= 300) return "GOLD";
        else if (tierPoints >= 200) return "SILVER";
        else return "BRONZE";
    }

}
