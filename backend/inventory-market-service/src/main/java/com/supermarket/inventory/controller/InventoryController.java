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
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return inventoryService.getInventory(sortBy, direction);
    }

    @GetMapping("/getInventory/{sourceType}/{productId}")
    public Double getInventoryBySourceTypeAndProductId(
            @PathVariable String sourceType,
            @PathVariable String productId) {
        return inventoryService.getQuantityByProductIdAndSourceType(productId, SourceType.valueOf(sourceType));
    }

}
