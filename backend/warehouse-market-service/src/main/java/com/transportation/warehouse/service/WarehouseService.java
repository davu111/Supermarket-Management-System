package com.transportation.warehouse.service;

import com.transportation.warehouse.dto.request.WarehouseRequest;
import com.transportation.warehouse.dto.response.WarehouseResponse;
import com.transportation.warehouse.mapper.WarehouseMapper;
import com.transportation.warehouse.model.Warehouse;
import com.transportation.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    // CREATE
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        Warehouse warehouse = warehouseMapper.toWarehouse(request);

        warehouseRepository.save(warehouse);

        return warehouseMapper.toWarehouseResponse(warehouse);
    }

    // GET ALL WAREHOUSES
    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findAll()
                .stream()
                .map(warehouseMapper::toWarehouseResponse)
                .toList();
    }

    // GET LIST INVENTORY
    public ResponseEntity<List<WarehouseResponse>> getWarehousesByIds(
             Map<String, List<String>> request) {

        List<String> warehouseIds = request.get("warehouseIds");
        List<Warehouse> warehouses = warehouseRepository.findByIdIn(warehouseIds);

        List<WarehouseResponse> responses = warehouses.stream()
                .map(warehouseMapper::toWarehouseResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // GET ALL WAREHOUSE NAMES
    public Map<String, String> getAllWarehouseNames() {
        return warehouseRepository.findAll()
                .stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                Warehouse::getId,
                                Warehouse::getName
                        )
                );
    }

    // GET WAREHOUSE BY ID
    public WarehouseResponse getWarehouseById(String id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
        return warehouseMapper.toWarehouseResponse(warehouse);
    }

    // UPDATE WAREHOUSE BY ID
    public WarehouseResponse updateWarehouse(String id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));

        warehouseMapper.updateWarehouseFromRequest(request, warehouse);

        warehouseRepository.save(warehouse);

        return warehouseMapper.toWarehouseResponse(warehouse);
    }

    // DELETE WAREHOUSE BY ID
    public void delete(String id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
        warehouseRepository.delete(warehouse);
    }

}
