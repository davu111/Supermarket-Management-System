package com.supermarket.product_market_service.repository;

import com.supermarket.product_market_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByIdIn(Set<String> productIds);

    Product findByProductCode(String productCode);
}
