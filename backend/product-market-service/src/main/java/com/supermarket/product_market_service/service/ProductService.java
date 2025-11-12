package com.transportation.product.service;

import com.transportation.product.dto.request.ProductRequest;
import com.transportation.product.dto.response.ProductResponse;
import com.transportation.product.mapper.ProductMapper;
import com.transportation.product.model.Product;
import com.transportation.product.repository.ProductRepository;
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

    /// STAGE 1 ONLY ///
    public ResponseEntity<List<ProductResponse>> getProducts_Stage1(
             Map<String, Set<String>> request) {

        Set<String> productIds = request.get("productIds");
        List<Product> products = productRepository.findByIdIn(productIds);

        List<ProductResponse> responses = products.stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}
