package com.supermarket.inventory.controller;

import com.supermarket.inventory.dto.request.ConfirmRequest;
import com.supermarket.inventory.dto.response.InventoryResponse;
import com.supermarket.inventory.model.SourceType;
import com.supermarket.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping({"/getInventory", "/getInventory/{sourceId}"})
    public List<InventoryResponse> getInventory(
            @PathVariable(required = false) String sourceId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return inventoryService.getInventoryBySourceId(sourceId, sortBy, direction);
    }

    @GetMapping("/getInventory/{sourceType}/{productId}")
    public Double getInventoryBySourceTypeAndProductId(
            @PathVariable String sourceType,
            @PathVariable String productId) {
        return inventoryService.getQuantityByProductIdAndSourceType(productId, SourceType.valueOf(sourceType));
    }

    @DeleteMapping("/deleteInventory/{sourceId}")
    public void deleteInventory(
            @PathVariable String sourceId,
            @RequestBody List<ConfirmRequest> listInventoryRequest) {
        List<String> productIds = listInventoryRequest.stream()
                .map(ConfirmRequest::getProductId)
                .toList();
        inventoryService.deleteInventoryByProductIdAndSourceId(sourceId, productIds);
    }

    @DeleteMapping("/deleteOneInventory/{sourceId}/{productId}")
    public void deleteOneInventory(
            @PathVariable String sourceId,
            @PathVariable String productId) {
        inventoryService.deleteOneInventoryByProductIdAndSourceId(sourceId, productId);
    }

    @PutMapping("/updateInventory/{sourceId}")
    public void updateInventory(
            @PathVariable String sourceId,
            @RequestBody List<ConfirmRequest> listInventoryRequest) {
        inventoryService.updateInventoryQuantityByProductIdAndSourceId(sourceId, listInventoryRequest);
    }

}
