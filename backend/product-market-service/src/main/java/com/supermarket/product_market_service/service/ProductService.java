package com.supermarket.product_market_service.service;

import com.supermarket.product_market_service.dto.request.ProductRequest;
import com.supermarket.product_market_service.dto.response.ProductResponse;
import com.supermarket.product_market_service.mapper.ProductMapper;
import com.supermarket.product_market_service.model.Product;
import com.supermarket.product_market_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MinioService minioService;

    // CREATE
    public ProductResponse createProduct(ProductRequest request) {
        Product product = productMapper.toProduct(request);
        product.setCreatedAt(LocalDateTime.now());

        productRepository.save(product);

        log.info("Product create successfully");
        return productMapper.toProductResponse(product);
    }

    // GET ALL PRODUCTS
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    // GET PRODUCT BY ID
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return productMapper.toProductResponse(product);
    }

    // UPDATE
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        productMapper.updateProductFromRequest(request, product);
        product.setUpdatedAt(LocalDateTime.now());

        productRepository.save(product);

        log.info("Product update successfully");
        return productMapper.toProductResponse(product);
    }

    // DELETE
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        productRepository.delete(product);

        log.info("Product delete successfully");
    }

    // GET PRODUCT AND CREATE IMG URL BY PRODUCT CODE
    public ProductResponse getByProductCode(String productCode) {
        Product product = productRepository.findByProductCode(productCode);

        ProductResponse response = productMapper.toProductResponse(product);
        String imageUrl = minioService.getImageUrl(product.getId());
        response.setImageUrl(imageUrl);

        return response;
    }
}
