package com.transportation.inventory.controller;

import com.transportation.inventory.dto.request.InventoryTransactionRequest;
import com.transportation.inventory.dto.response.InventoryTransactionResponse;
import com.transportation.inventory.model.InventoryTransaction;
import com.transportation.inventory.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/transactions")
@RequiredArgsConstructor
public class InventoryTransactionController {

    private final InventoryTransactionService inventoryTransactionService;

    /**
     * Thực hiện giao dịch nhập/xuất kho đơn lẻ
     */
    @PostMapping
    public ResponseEntity<InventoryTransactionResponse> createTransaction(
            @RequestBody InventoryTransactionRequest request) {

        InventoryTransactionResponse response =
                inventoryTransactionService.transactionInventory(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Thực hiện batch transaction (nhiều sản phẩm cùng lúc)
     */
    @PostMapping("/batch")
    public ResponseEntity<List<InventoryTransactionResponse>> batchTransaction(
            @RequestBody List<InventoryTransactionRequest> request) {

        List<InventoryTransactionResponse> responses =
                inventoryTransactionService.batchTransactionInventory(request);

        return ResponseEntity.ok(responses);
    }

    /**
     * Lấy lịch sử giao dịch theo warehouse
     */
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<InventoryTransaction>> getWarehouseHistory(
            @PathVariable String warehouseId) {

        List<InventoryTransaction> history =
                inventoryTransactionService.getTransactionHistory(warehouseId);

        return ResponseEntity.ok(history);
    }

    // Lay lich su giao dich theo ngay va theo warehouse
    @GetMapping("/getAllGrouped")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<LocalDate, Map<String, List<InventoryTransaction>>>>
    getAllGroupedByDateAndWarehouse(@RequestParam(required = false) LocalDate startDate,
                                    @RequestParam(required = false) LocalDate endDate) {
        Map<LocalDate, Map<String, List<InventoryTransaction>>> responses =
                inventoryTransactionService.groupTransactionsByDateAndWarehouse(startDate, endDate);
        return ResponseEntity.ok(responses);
    }
}
