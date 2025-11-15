package com.transportation.warehouse.controller;

import com.transportation.warehouse.dto.request.WarehouseRequest;
import com.transportation.warehouse.dto.response.WarehouseResponse;
import com.transportation.warehouse.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService warehouseService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public WarehouseResponse createWarehouse(@RequestBody WarehouseRequest request){
        return warehouseService.createWarehouse(request);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseService.getAllWarehouses();
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WarehouseResponse>> getWarehousesByIds(
            @RequestBody Map<String, List<String>> request) {
        return warehouseService.getWarehousesByIds(request);
    }

    @GetMapping("/all-names")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> getAllWarehouseNames() {return warehouseService.getAllWarehouseNames();}

    @GetMapping("/get/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public WarehouseResponse getWarehouseById(@PathVariable String id) {
        return warehouseService.getWarehouseById(id);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public WarehouseResponse updateWarehouse(@PathVariable String id, @RequestBody WarehouseRequest request) {
        return warehouseService.updateWarehouse(id, request);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteWarehouse(@PathVariable String id) {
        warehouseService.delete(id);
    }
}
