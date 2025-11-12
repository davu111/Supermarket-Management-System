package com.supermarket.product_market_service.repository;

import com.supermarket.product_market_service.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    Optional<ProductImage> findByProductId(String productId);
//    List<ProductImage> findByProductId(String productId);
}

