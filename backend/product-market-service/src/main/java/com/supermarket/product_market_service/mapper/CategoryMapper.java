package com.supermarket.product_market_service.mapper;

import com.supermarket.product_market_service.dto.request.CategoryRequest;
import com.supermarket.product_market_service.dto.response.CategoryResponse;
import com.supermarket.product_market_service.model.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory (CategoryRequest request);
    CategoryResponse toCategoryResponse (Category category);
}
