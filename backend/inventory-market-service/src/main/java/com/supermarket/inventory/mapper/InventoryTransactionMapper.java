package com.transportation.inventory.mapper;

import com.transportation.inventory.dto.request.InventoryTransactionRequest;
import com.transportation.inventory.dto.response.InventoryTransactionResponse;
import com.transportation.inventory.enums.TransactionType;
import com.transportation.inventory.model.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    // Hàm map toàn bộ request sang danh sách entity
    InventoryTransactionResponse toInventoryTransactionResponse(InventoryTransaction transaction);
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    InventoryTransaction toInventoryTransaction(InventoryTransactionRequest request);
}

