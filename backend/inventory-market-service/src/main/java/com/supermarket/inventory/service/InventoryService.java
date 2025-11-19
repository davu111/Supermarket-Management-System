package com.transportation.inventory.service;

import com.transportation.inventory.dto.request.AddToCartRequest;
import com.transportation.inventory.dto.request.ConfirmRequest;
import com.transportation.inventory.dto.request.OrderRequest;
import com.transportation.inventory.dto.response.*;
import com.transportation.inventory.mapper.InventoryMapper;
import com.transportation.inventory.model.Inventory;
import com.transportation.inventory.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

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
    public List<InventoryResponse> getInventoryBySourceId(String sourceId, String sortBy, String direction) {
        String tokenValue = getToken();

        Sort.Direction sortDirection =
                "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        List<InventoryResponse> responses = inventoryRepository.findBySourceId(sourceId)
                .stream()
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

    public Inventory addProductToCart(AddToCartRequest request) {
        String tokenValue = getToken();

        // 🔸 Gọi sang order-service, truyền token
        OrderResponse orderResponse = webClient.post()
                .uri("/orders/addToCart/{userId}", request.getUserId())
                .headers(headers -> {
                    assert tokenValue != null;
                    headers.setBearerAuth(tokenValue);
                }) // ✅ Gắn Authorization header
                .retrieve()
                .bodyToMono(OrderResponse.class)
                .block();

        assert orderResponse != null;
        String orderId = orderResponse.getId();

        // 2. Tìm Inventory theo orderId + productId
        Optional<Inventory> existing = inventoryRepository.findBySourceIdAndProductId(orderId, request.getProductId());

        Inventory inventory;
        if (existing.isPresent()) {
            inventory = existing.get();
            inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        } else {
            inventory = new Inventory();
            inventory.setSourceId(orderId);
            inventory.setProductId(request.getProductId());
            inventory.setQuantity(request.getQuantity());
        }

        return inventoryRepository.save(inventory);
    }

    public List<OrderStatusResponse> getInventoryWithUserIdAndStatus(OrderRequest request) {
        String tokenValue = getToken();

        // 🔸 Gọi sang order-service, truyền token
        List<OrderResponse> orderResponses = webClient.post()
                .uri("/orders/getWithStatus")
                .headers(headers -> {
                    assert tokenValue != null;
                    headers.setBearerAuth(tokenValue);
                }) // ✅ Gắn Authorization header
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(OrderResponse.class) // ⚡ nhận nhiều phần tử
                .collectList()                    // chuyển thành List
                .block();                         // ⚠️ block để dùng sync

        assert orderResponses != null;

        // 🔸 Chuyển đổi từng OrderResponse thành OrderStatusResponse
        List<OrderStatusResponse> responses = orderResponses.stream()
                .map(order -> {
                    OrderStatusResponse statusResponse = new OrderStatusResponse();
                    statusResponse.setOrderId(order.getId());
                    statusResponse.setListInventory(
                            getInventoryBySourceId(order.getId(), "name", "asc")
                    );
                    statusResponse.setCreatedAt(order.getCreatedAt());
                    return statusResponse;
                })
                .toList();
        Comparator<OrderStatusResponse> comparator;

        comparator = Comparator.comparing(OrderStatusResponse::getCreatedAt);
        comparator = comparator.reversed();


        return responses.stream().sorted(comparator).toList();
    }

    // CREATE INVENTORY WITH SOURCE ID
    public Inventory createInventoryWithSourceId(String sourceId, ConfirmRequest request) {
        Inventory inventory = new Inventory();
        inventory.setSourceId(sourceId);
        inventory.setProductId(request.getProductId());
        inventory.setQuantity(request.getQuantity());
        return inventoryRepository.save(inventory);
    }

    // CREATE PENDING ORDER WITH LIST OF INVENTORY
    public void createPendingOrderWithInventory(String userId, List<ConfirmRequest> listInventory) {
        String tokenValue = getToken();
        OrderRequest request = OrderRequest.builder()
                .userId(userId)
                .status("PENDING")
                .build();

        // 🔸 Gọi sang order-service, truyền token
        OrderResponse orderResponse = webClient.post()
                .uri("/orders/create")
                .headers(headers -> {
                    assert tokenValue != null;
                    headers.setBearerAuth(tokenValue);
                }) // ✅ Gắn Authorization header
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OrderResponse.class)
                .block();

        assert orderResponse != null;
        String orderId = orderResponse.getId();
        for (ConfirmRequest confirmRequest : listInventory) {
            createInventoryWithSourceId(orderId, confirmRequest);
        }
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
    // UPDATE INVENTORY QUANTITY BY PRODUCT ID AND SOURCE ID
    @Transactional
    public void updateInventoryQuantityByProductIdAndSourceId(String sourceId, List<ConfirmRequest> listInventoryRequest) {
        log.info(listInventoryRequest.toString());
        for (ConfirmRequest req : listInventoryRequest) {
            inventoryRepository.updateQuantityByProductIdAndSourceId(
                    sourceId,
                    req.getProductId(),
                    req.getQuantity()
            );
        }
    }



    // DELETE INVENTORY BY PRODUCT ID AND SOURCE ID
    @Transactional
    public void deleteInventoryByProductIdAndSourceId(String sourceId, List<String> productIds) {
        inventoryRepository.deleteByProductIdInAndSourceId(productIds, sourceId);
    }

    // DELETE ONE INVENTORY BY PRODUCT ID AND SOURCE ID
    @Transactional
    public void deleteOneInventoryByProductIdAndSourceId(String sourceId, String productId) {
        inventoryRepository.deleteByProductIdAndSourceId(productId, sourceId);
    }

    /// STAGE 1 ONLY //
    public ResponseEntity<List<InventoryStage1Response>> getBySourceIds_Stage1(
            Map<String, Set<String>> request) {

        Set<String> sourceIds = request.get("sourceIds");
        List<Inventory> inventories = inventoryRepository.findBySourceIds(sourceIds);

        return ResponseEntity.ok(toResponses(inventories));
    }

    public ResponseEntity<List<InventoryStage1Response>> getByOrderIds_Stage1(
            Map<String, Set<String>> request) {

        Set<String> orderIds = request.get("orderIds");
        List<Inventory> inventories = inventoryRepository.findBySourceIds(orderIds);

        return ResponseEntity.ok(toResponses(inventories));
    }

    private List<InventoryStage1Response> toResponses(List<Inventory> inventories) {
        return inventories.stream()
                .map(mapper::toInventoryStage1Response)
                .collect(Collectors.toList());
    }
}
