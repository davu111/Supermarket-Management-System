package com.supermarket.inventory.controller;

import com.supermarket.inventory.dto.request.InventoryTransactionRequest;
import com.supermarket.inventory.dto.response.InventoryTransactionResponse;
import com.supermarket.inventory.model.InventoryTransaction;
import com.supermarket.inventory.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    // Lay lich su giao dich theo ngay va theo warehouse
    @GetMapping("/getAllGrouped")
    public ResponseEntity<Map<LocalDate, List<InventoryTransaction>>>
    getAllGroupedByDateAndWarehouse(@RequestParam(required = false) LocalDate startDate,
                                    @RequestParam(required = false) LocalDate endDate) {
        Map<LocalDate, List<InventoryTransaction>> responses =
                inventoryTransactionService.groupTransactionsByDate(startDate, endDate);
        return ResponseEntity.ok(responses);
    }
}
