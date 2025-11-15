package com.transportation.inventory.mapper;

import com.transportation.inventory.dto.response.InventoryStage1Response;
import com.transportation.inventory.dto.response.InventoryResponse;
import com.transportation.inventory.model.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {
    @Mapping(target = "productId", source = "inventory.productId")
    @Mapping(target = "quantity", source = "inventory.quantity")
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "price", ignore = true)
    InventoryResponse toInventoryResponse(Inventory inventory);

    InventoryStage1Response toInventoryStage1Response(Inventory inventory);
}
