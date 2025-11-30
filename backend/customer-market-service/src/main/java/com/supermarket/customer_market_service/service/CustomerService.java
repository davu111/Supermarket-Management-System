package com.supermarket.customer_market_service.service;

import com.supermarket.customer_market_service.dto.request.CustomerRequest;
import com.supermarket.customer_market_service.dto.response.CustomerResponse;
import com.supermarket.customer_market_service.mapper.CustomerMapper;
import com.supermarket.customer_market_service.model.Customer;
import com.supermarket.customer_market_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + id));
        return customerMapper.toCustomerResponse(customer);
    }

    public List<CustomerResponse> searchByCardNumber(String cardNumber) {
        return customerRepository.findByCardNumberContainingIgnoreCase(cardNumber).stream()
                .map(customerMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    public Long getCustomerIdByCardNumber(String cardNumber) {
        Customer customer = customerRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với mã số thẻ: " + cardNumber));
        return customer.getId();
    }

    public void addRewardPointsAndTierPoints(Long customerId, Integer rewardPoints, Integer tierPoints) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));

        customer.setRewardPoints(customer.getRewardPoints() + rewardPoints);
        customer.setTierPoints(customer.getTierPoints() + tierPoints);
        customerRepository.save(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Clean card number before checking (remove prefix if user accidentally added)
        String cleanCardNumber = removePrefix(request.getCardNumber());
        String expectedCardNumber = getTierPrefix(request.getTierPoints()) + cleanCardNumber;

        if (customerRepository.existsByCardNumber(expectedCardNumber)) {
            throw new RuntimeException("Mã số thẻ đã tồn tại");
        }

        Customer customer = customerMapper.toCustomer(request);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(savedCustomer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + id));

        if (!customer.getEmail().equals(request.getEmail()) &&
                customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Check card number with new tier prefix
        String cleanCardNumber = removePrefix(request.getCardNumber());
        String expectedCardNumber = getTierPrefix(request.getTierPoints()) + cleanCardNumber;

        if (!customer.getCardNumber().equals(expectedCardNumber) &&
                customerRepository.existsByCardNumber(expectedCardNumber)) {
            throw new RuntimeException("Mã số thẻ đã tồn tại");
        }

        customerMapper.updateCustomerFromRequest(request, customer);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(updatedCustomer);
    }

    // Helper methods
    private String removePrefix(String cardNumber) {
        if (cardNumber != null && cardNumber.matches("^[DPGSB]CARD.*")) {
            return cardNumber.substring(1);
        }
        return cardNumber;
    }

    private String getTierPrefix(Integer tierPoints) {
        if (tierPoints == null) return "C";
        if (tierPoints >= 500) return "D";
        if (tierPoints >= 400) return "P";
        if (tierPoints >= 300) return "G";
        if (tierPoints >= 200) return "S";
        return "C";
    }

    @Transactional
    public void deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + id));

        customer.setActive(false);
        customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khách hàng với ID: " + id);
        }
        customerRepository.deleteById(id);
    }
}
