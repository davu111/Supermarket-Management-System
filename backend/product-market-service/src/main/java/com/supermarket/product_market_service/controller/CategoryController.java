package com.supermarket.product_market_service.controller;

import com.supermarket.product_market_service.dto.response.CategoryResponse;
import com.supermarket.product_market_service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("/all")
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

}
