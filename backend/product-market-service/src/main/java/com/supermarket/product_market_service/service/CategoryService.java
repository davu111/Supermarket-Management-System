package com.supermarket.product_market_service.service;

import com.supermarket.product_market_service.dto.request.CategoryRequest;
import com.supermarket.product_market_service.dto.response.CategoryResponse;
import com.supermarket.product_market_service.mapper.CategoryMapper;
import com.supermarket.product_market_service.model.Category;
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

    // CREATE CATEGORY
    public CategoryResponse createCategory(String name) {
        var category = categoryRepository.save(
                Category.builder()
                        .name(name)
                        .build()
        );
        return categoryMapper.toCategoryResponse(category);
    }

    // UPDATE CATEGORY
    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        var category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        category = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(category);
    }

    // DELETE CATEGORY
    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}
