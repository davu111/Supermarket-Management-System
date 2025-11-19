package com.supermarket.inventory.mapper;

import com.supermarket.inventory.dto.request.InventoryTransactionRequest;
import com.supermarket.inventory.dto.response.InventoryTransactionResponse;
import com.supermarket.inventory.model.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    // Hàm map toàn bộ request sang danh sách entity
    InventoryTransactionResponse toInventoryTransactionResponse(InventoryTransaction transaction);
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    InventoryTransaction toInventoryTransaction(InventoryTransactionRequest request);
}

