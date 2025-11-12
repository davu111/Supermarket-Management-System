package com.transportation.product.service;

import com.transportation.product.dto.response.ProductImageResponse;
import com.transportation.product.mapper.ProductImageMapper;
import com.transportation.product.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductImageService {
    private final ProductImageRepository repository;
    private final ProductImageMapper mapper;

    public ProductImageResponse getByProductId(String productId) {
         return repository.findByProductId(productId)
                .map(mapper::toProductImageResponse)
                .orElse(null);
    }

    public List<ProductImageResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toProductImageResponse)
                .collect(Collectors.toList());
    }
}
