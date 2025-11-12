package com.transportation.product.mapper;

import com.transportation.product.dto.response.ProductImageResponse;
import com.transportation.product.model.ProductImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    ProductImageResponse toProductImageResponse(ProductImage productImage);
}
