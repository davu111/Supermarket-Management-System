package com.supermarket.product_market_service.mapper;

import com.supermarket.product_market_service.dto.response.ProductImageResponse;
import com.supermarket.product_market_service.model.ProductImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    ProductImageResponse toProductImageResponse(ProductImage productImage);
}
