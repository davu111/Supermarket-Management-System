package com.supermarket.inventory.service;

import com.supermarket.inventory.dto.request.InventoryTransactionRequest;
import com.supermarket.inventory.dto.response.InventoryTransactionResponse;
import com.supermarket.inventory.mapper.InventoryTransactionMapper;
import com.supermarket.inventory.model.Inventory;
import com.supermarket.inventory.model.InventoryTransaction;
import com.supermarket.inventory.model.SourceType;
import com.supermarket.inventory.repository.InventoryRepository;
import com.supermarket.inventory.repository.InventoryTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
        log.info("Processing inventory transaction: type={}, productId={}, quantity={}",
                request.getType(), request.getProductId(), request.getQuantity());

        // 1. Validate request
        validateRequest(request);

        // 2. Lấy inventory từ warehouse
        Inventory inventoryWarehouse = getOrCreateInventory(SourceType.WAREHOUSE, request.getProductId());
        Inventory inventoryShelf = getOrCreateInventory(SourceType.SHELF, request.getProductId());

        // 3. Tính toán số lượng mới
        double oldQuantityWarehouse = inventoryWarehouse.getQuantity();
        double newQuantityWarehouse = calculateNewQuantityForWarehouse(inventoryWarehouse, request);
        double oldQuantityShelf = inventoryShelf.getQuantity();
        double newQuantityShelf = calculateNewQuantityForShelf(inventoryShelf, request);

        // 4. Validate số lượng
        if (newQuantityWarehouse < 0) {
            throw new RuntimeException(String.format(
                    "Not enough inventory for product %s. Available: %d, Required: %d",
                    request.getProductId(), oldQuantityWarehouse, request.getQuantity()));
        }

        // 5. Update inventory
        inventoryWarehouse.setQuantity(newQuantityWarehouse);
        inventoryRepository.save(inventoryWarehouse);

        inventoryShelf.setQuantity(newQuantityShelf);
        inventoryRepository.save(inventoryShelf);

        // 6. Tạo transaction history
        InventoryTransaction transaction = inventoryTransactionMapper.toInventoryTransaction(request);
        inventoryTransactionRepository.save(transaction);

//        log.info("Inventory transaction completed: transactionId={}, oldQuantityWarehouse={}, newQuantityWarehouse={}",
//                transaction.getId(), oldQuantityWarehouse, newQuantityWarehouse);

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


    // Lich su giao dich theo ngay
    public Map<LocalDate, List<InventoryTransaction>>
    groupTransactionsByDate(LocalDate startDate, LocalDate endDate) {
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
                t -> t.getCreatedAt().toLocalDate() // Group theo ngày
        ));
    }

    private void validateRequest(InventoryTransactionRequest request) {
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

    private Inventory getOrCreateInventory(SourceType sourceType, String productId) {
        return inventoryRepository.findBySourceTypeAndProductId(sourceType, productId)
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setSourceId(null);
                    newInventory.setProductId(productId);
                    newInventory.setSourceType(sourceType);
                    newInventory.setQuantity(0.0);
                    return inventoryRepository.save(newInventory);
                });
    }

    private double calculateNewQuantityForWarehouse(Inventory inventory, InventoryTransactionRequest request) {
        double currentQuantity = inventory.getQuantity();
        double transactionQuantity = request.getQuantity();

        return switch (request.getType()) {
            case EXPORT -> currentQuantity - transactionQuantity;
            case IMPORT -> currentQuantity + transactionQuantity;
            default -> throw new IllegalArgumentException("Invalid transaction type: " + request.getType());
        };
    }

    private double calculateNewQuantityForShelf(Inventory inventory, InventoryTransactionRequest request) {
        double currentQuantity = inventory.getQuantity();
        double transactionQuantity = request.getQuantity();

        return switch (request.getType()) {
            case EXPORT -> currentQuantity + transactionQuantity;
            case IMPORT -> currentQuantity;
            default -> throw new IllegalArgumentException("Invalid transaction type: " + request.getType());
        };
    }
}
