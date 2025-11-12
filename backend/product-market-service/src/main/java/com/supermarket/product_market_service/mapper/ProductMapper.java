package com.supermarket.product_market_service.mapper;

import com.supermarket.product_market_service.dto.request.ProductRequest;
import com.supermarket.product_market_service.dto.response.ProductResponse;
import com.supermarket.product_market_service.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toProduct (ProductRequest request);
    ProductResponse toProductResponse (Product product);
    void updateProductFromRequest(ProductRequest request, @MappingTarget Product product);
}
