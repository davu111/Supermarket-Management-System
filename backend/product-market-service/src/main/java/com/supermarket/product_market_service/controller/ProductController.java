package com.supermarket.product_market_service.controller;

import com.supermarket.product_market_service.dto.request.ProductRequest;
import com.supermarket.product_market_service.dto.response.ProductResponse;
import com.supermarket.product_market_service.service.MinioService;
import com.supermarket.product_market_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PreAuthorize("hasRole('WAREHOUSE')")
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse getProductById(@PathVariable String id) {
        return productService.getProductById(id);
    }

    @PreAuthorize("hasRole('WAREHOUSE')")
    @PutMapping("/update/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse updateProduct(@PathVariable String id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @PreAuthorize("hasRole('WAREHOUSE')")
    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
    }

    @PreAuthorize("hasRole('WAREHOUSE')")
    @DeleteMapping("/unDelete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unDeleteProduct(@PathVariable String id) {
        productService.unDeleteProduct(id);
    }

    @GetMapping("/images/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public String getProductImages(@PathVariable String productId) {
        return minioService.getImageUrl(productId);
    }

    // UPLOAD IMAGE
    @PostMapping("/images/upload/{productId}")
    public ResponseEntity<?> uploadProductImage(
            @PathVariable String productId,
            @RequestParam("file") MultipartFile file
    ) {
        // Upload to MinIO and save to ProductImage table
        minioService.uploadProductImage(productId, file);
        return ResponseEntity.ok("Image uploaded successfully");
    }
}
