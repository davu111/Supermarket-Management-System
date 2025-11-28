package com.supermarket.inventory.service;

import com.supermarket.inventory.dto.response.*;
import com.supermarket.inventory.mapper.InventoryMapper;
import com.supermarket.inventory.model.Inventory;
import com.supermarket.inventory.model.SourceType;
import com.supermarket.inventory.repository.InventoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final InventoryMapper mapper;
    private final WebClient webClient;

    public InventoryService(InventoryRepository inventoryRepository, InventoryMapper mapper, WebClient.Builder webClientBuilder) {
        this.inventoryRepository = inventoryRepository;
        this.mapper = mapper;
        this.webClient = webClientBuilder.baseUrl("http://localhost:9000/api").build();
    }

    // GET INVENTORY BY SOURCE ID
    public List<InventoryResponse> getInventory(String sortBy, String direction) {
        String tokenValue = getToken();

        Sort.Direction sortDirection =
                "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        List<Inventory> inventories;

        inventories = inventoryRepository.findBySourceType(SourceType.WAREHOUSE);

        List<InventoryResponse> responses = inventories.stream()
                .map(inventory -> {
                    InventoryResponse response = mapper.toInventoryResponse(inventory);

                    // gọi API lấy product info
                    ProductResponse product = webClient.get()
                            .uri("/products/{id}", response.getProductId())
                            .headers(headers -> {
                                assert tokenValue != null;
                                headers.setBearerAuth(tokenValue);
                            })
                            .retrieve()
                            .bodyToMono(ProductResponse.class)
                            .block(); // block vì đang dùng sync

                    if (product != null) {
                        response.setProductName(product.getName());
                        response.setPrice(product.getPrice());
                    }

                    return response;
                })
                .toList();
        Comparator<InventoryResponse> comparator;

        switch (sortBy) {
            case "name" -> comparator = Comparator.comparing(InventoryResponse::getProductName, String.CASE_INSENSITIVE_ORDER);
            case "quantity" -> comparator = Comparator.comparingInt(InventoryResponse::getQuantity);
            case "id" -> comparator = Comparator.comparing(InventoryResponse::getProductId);
            default -> comparator = Comparator.comparing(InventoryResponse::getProductId);
        }

        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }

        return responses.stream().sorted(comparator).toList();
    }

    public String getToken(){
        // 🔸 Lấy token từ SecurityContext
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String tokenValue;

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            tokenValue = jwtAuth.getToken().getTokenValue();
        } else {
            tokenValue = null;
        }
        return tokenValue;
    }

    // GET QUANTITY BY PRODUCT ID AND SOURCE TYPE
    public Double getQuantityByProductIdAndSourceType(String productId, SourceType sourceType) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findBySourceTypeAndProductId(sourceType, productId);
        return inventoryOpt.map(Inventory::getQuantity).orElse(0.0);
    }
}
