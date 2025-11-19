package com.transportation.inventory.controller;

import com.transportation.inventory.dto.request.AddToCartRequest;
import com.transportation.inventory.dto.request.ConfirmRequest;
import com.transportation.inventory.dto.request.OrderRequest;
import com.transportation.inventory.dto.response.InventoryStage1Response;
import com.transportation.inventory.dto.response.InventoryResponse;
import com.transportation.inventory.dto.response.OrderStatusResponse;
import com.transportation.inventory.model.Inventory;
import com.transportation.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping("/{sourceId}")
    public List<InventoryResponse> getInventory(
            @PathVariable String sourceId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return inventoryService.getInventoryBySourceId(sourceId, sortBy, direction);
    }

    @PostMapping("/addToCart")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Inventory> addToCart(@RequestBody AddToCartRequest request) {
        Inventory updatedInventory = inventoryService.addProductToCart(request);
        return ResponseEntity.ok(updatedInventory);
    }

    @PostMapping("/getWithStatus")
    @PreAuthorize("hasRole('USER')")
    public List<OrderStatusResponse> getInventoryWithUserIdAndStatus(@RequestBody OrderRequest request){
        return inventoryService.getInventoryWithUserIdAndStatus(request);
    }

    @PostMapping("/createPendingOrder/{userId}")
    @PreAuthorize("hasRole('USER')")
    public void createPendingOrder(@PathVariable String userId, @RequestBody List<ConfirmRequest> listInventoryRequest) {
        inventoryService.createPendingOrderWithInventory(userId, listInventoryRequest);
    }

    @DeleteMapping("/deleteInventory/{sourceId}")
    @PreAuthorize("hasRole('USER')")
    public void deleteInventory(
            @PathVariable String sourceId,
            @RequestBody List<ConfirmRequest> listInventoryRequest) {
        List<String> productIds = listInventoryRequest.stream()
                .map(ConfirmRequest::getProductId)
                .toList();
        inventoryService.deleteInventoryByProductIdAndSourceId(sourceId, productIds);
    }

    @DeleteMapping("/deleteOneInventory/{sourceId}/{productId}")
    @PreAuthorize("hasRole('USER')")
    public void deleteOneInventory(
            @PathVariable String sourceId,
            @PathVariable String productId) {
        inventoryService.deleteOneInventoryByProductIdAndSourceId(sourceId, productId);
    }

    @PutMapping("/updateInventory/{sourceId}")
    @PreAuthorize("hasRole('USER')")
    public void updateInventory(
            @PathVariable String sourceId,
            @RequestBody List<ConfirmRequest> listInventoryRequest) {
        inventoryService.updateInventoryQuantityByProductIdAndSourceId(sourceId, listInventoryRequest);
    }

    ///  STAGE 1 API ///
    @PostMapping("/by-sources-stage1")
    public ResponseEntity<List<InventoryStage1Response>> getBySourceIds(
            @RequestBody Map<String, Set<String>> request) {
        return inventoryService.getBySourceIds_Stage1(request);
    }

    @PostMapping("/by-orders-stage1")
    public ResponseEntity<List<InventoryStage1Response>> getByOrderIds(
            @RequestBody Map<String, Set<String>> request) {
        return inventoryService.getByOrderIds_Stage1(request);
    }

}
