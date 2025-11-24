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

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (customerRepository.existsByCardNumber(request.getCardNumber())) {
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

        // Check email uniqueness if changed
        if (!customer.getEmail().equals(request.getEmail()) &&
                customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Check card number uniqueness if changed
        if (!customer.getCardNumber().equals(request.getCardNumber()) &&
                customerRepository.existsByCardNumber(request.getCardNumber())) {
            throw new RuntimeException("Mã số thẻ đã tồn tại");
        }

        customerMapper.updateCustomerFromRequest(request, customer);

        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(updatedCustomer);
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
