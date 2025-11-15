package com.transportation.inventory.service;

import com.transportation.inventory.dto.request.InventoryTransactionRequest;
import com.transportation.inventory.dto.response.InventoryTransactionResponse;
import com.transportation.inventory.mapper.InventoryTransactionMapper;
import com.transportation.inventory.model.Inventory;
import com.transportation.inventory.model.InventoryTransaction;
import com.transportation.inventory.repository.InventoryRepository;
import com.transportation.inventory.repository.InventoryTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryTransactionService {
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final InventoryTransactionMapper inventoryTransactionMapper;

    /**
     * Thực hiện giao dịch nhập/xuất kho
     */
    @Transactional
    public InventoryTransactionResponse transactionInventory(InventoryTransactionRequest request) {
        log.info("Processing inventory transaction: type={}, warehouseId={}, deliveryPointId={}, productId={}, quantity={}",
                request.getType(), request.getWarehouseId(), request.getDeliveryPointId(),
                request.getProductId(), request.getQuantity());

        // 1. Validate request
        validateRequest(request);

        // 2. Lấy inventory từ warehouse
        Inventory inventory = getOrCreateInventory(request.getWarehouseId(), request.getProductId());

        // 3. Tính toán số lượng mới
        double oldQuantity = inventory.getQuantity();
        double newQuantity = calculateNewQuantity(inventory, request);

        // 4. Validate số lượng
        if (newQuantity < 0) {
            throw new RuntimeException(String.format(
                    "Not enough inventory for product %s. Available: %d, Required: %d",
                    request.getProductId(), oldQuantity, request.getQuantity()));
        }

        // 5. Update inventory
        inventory.setQuantity(newQuantity);
        inventoryRepository.save(inventory);

        // 6. Tạo transaction history
        InventoryTransaction transaction = inventoryTransactionMapper.toInventoryTransaction(request);
        inventoryTransactionRepository.save(transaction);

//        log.info("Inventory transaction completed: transactionId={}, oldQuantity={}, newQuantity={}",
//                transaction.getId(), oldQuantity, newQuantity);

        // 7. Return response
        return inventoryTransactionMapper.toInventoryTransactionResponse(transaction);
    }

    /**
     * Thực hiện batch transaction (nhiều sản phẩm cùng lúc)
     */
    @Transactional
    public List<InventoryTransactionResponse> batchTransactionInventory(
            List<InventoryTransactionRequest> batchRequest) {

        log.info("Processing batch inventory transaction: {} items",
                batchRequest.size());

        List<InventoryTransactionResponse> responses = new ArrayList<>();

        for (InventoryTransactionRequest request : batchRequest) {
            try {
                InventoryTransactionResponse response = transactionInventory(request);
                responses.add(response);
            } catch (Exception e) {
                log.error("Failed to process transaction for product {}: {}",
                        request.getProductId(), e.getMessage());

                // Nếu có lỗi, rollback toàn bộ transaction
                throw new RuntimeException(
                        "Batch transaction failed at product " + request.getProductId(), e);
            }
        }

        log.info("Batch transaction completed successfully: {} items processed", responses.size());
        return responses;
    }

    /**
     * Lấy lịch sử giao dịch theo warehouse
     */
    public List<InventoryTransaction> getTransactionHistory(String warehouseId) {
        return inventoryTransactionRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
    }

    // Lich su giao dich theo ngay va theo warehouse
    public Map<LocalDate, Map<String, List<InventoryTransaction>>>
    groupTransactionsByDateAndWarehouse(LocalDate startDate, LocalDate endDate) {
        List<InventoryTransaction> transactions = inventoryTransactionRepository.findAll();

        // Lọc theo khoảng thời gian nếu có
        Stream<InventoryTransaction> stream = transactions.stream();

        if (startDate != null) {
            stream = stream.filter(t -> !t.getCreatedAt().toLocalDate().isBefore(startDate));
        }
        if (endDate != null) {
            stream = stream.filter(t -> !t.getCreatedAt().toLocalDate().isAfter(endDate));
        }

        return stream.collect(Collectors.groupingBy(
                t -> t.getCreatedAt().toLocalDate(), // Group theo ngày
                Collectors.groupingBy(InventoryTransaction::getWarehouseId) // Group theo warehouse
        ));
    }

    private void validateRequest(InventoryTransactionRequest request) {
        if (request.getWarehouseId() == null || request.getWarehouseId().isEmpty()) {
            throw new IllegalArgumentException("Warehouse ID is required");
        }
        if (request.getProductId() == null || request.getProductId().isEmpty()) {
            throw new IllegalArgumentException("Product ID is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        if (request.getType() == null) {
            throw new IllegalArgumentException("Transaction type is required");
        }
    }

    private Inventory getOrCreateInventory(String warehouseId, String productId) {
        return inventoryRepository.findBySourceIdAndProductId(warehouseId, productId)
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setSourceId(warehouseId);
                    newInventory.setProductId(productId);
                    newInventory.setQuantity(0.0);
                    return inventoryRepository.save(newInventory);
                });
    }

    private double calculateNewQuantity(Inventory inventory, InventoryTransactionRequest request) {
        double currentQuantity = inventory.getQuantity();
        double transactionQuantity = request.getQuantity();

        return switch (request.getType()) {
            case EXPORT -> currentQuantity - transactionQuantity;
            case IMPORT -> currentQuantity + transactionQuantity;
            default -> throw new IllegalArgumentException("Invalid transaction type: " + request.getType());
        };
    }
}
