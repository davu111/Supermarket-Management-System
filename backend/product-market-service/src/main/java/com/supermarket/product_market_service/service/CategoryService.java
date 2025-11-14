package com.supermarket.product_market_service.service;

import com.supermarket.product_market_service.dto.response.CategoryResponse;
import com.supermarket.product_market_service.mapper.CategoryMapper;
import com.supermarket.product_market_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    // GET ALL CATEGORIES
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();
    }
}
