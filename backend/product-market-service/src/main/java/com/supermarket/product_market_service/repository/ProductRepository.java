package com.transportation.product.repository;

import com.transportation.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByIdIn(Set<String> productIds);
}
