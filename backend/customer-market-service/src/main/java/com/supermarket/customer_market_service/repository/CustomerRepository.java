package com.supermarket.customer_market_service.repository;

import com.supermarket.customer_market_service.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCardNumber(String cardNumber);

    List<Customer> findByCardNumberContainingIgnoreCase(String cardNumber);

    boolean existsByEmail(String email);

    boolean existsByCardNumber(String cardNumber);

    List<Customer> findByActiveTrue();
}
