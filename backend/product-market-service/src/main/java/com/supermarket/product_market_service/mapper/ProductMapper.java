package com.transportation.product.mapper;

import com.transportation.product.dto.request.ProductRequest;
import com.transportation.product.dto.response.ProductResponse;
import com.transportation.product.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toProduct (ProductRequest request);
    ProductResponse toProductResponse (Product product);
    void updateProductFromRequest(ProductRequest request, @MappingTarget Product product);
}
