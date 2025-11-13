package com.supermarket.product_market_service.controller;

import com.supermarket.product_market_service.dto.response.ProductResponse;
import com.supermarket.product_market_service.service.MinioService;
import com.supermarket.product_market_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final MinioService minioService;

    @GetMapping("/getByProductCode/{productCode}")
    public ProductResponse getByProductCode(@PathVariable String productCode) {
        return productService.getByProductCode(productCode);
    }

    @PostMapping("/getListProducts")
    public List<ProductResponse> getListProducts(@RequestBody List<String> productIds) {
        return productService.getByProductIds(productIds);
    }
}
