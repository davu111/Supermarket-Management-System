package com.supermarket.inventory.mapper;

import com.supermarket.inventory.dto.response.InventoryResponse;
import com.supermarket.inventory.model.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {
    @Mapping(target = "productId", source = "inventory.productId")
    @Mapping(target = "quantity", source = "inventory.quantity")
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "price", ignore = true)
    InventoryResponse toInventoryResponse(Inventory inventory);
}
