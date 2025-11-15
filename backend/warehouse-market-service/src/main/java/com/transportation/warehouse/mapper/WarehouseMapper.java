package com.transportation.warehouse.mapper;

import com.transportation.warehouse.dto.request.WarehouseRequest;
import com.transportation.warehouse.dto.response.WarehouseResponse;
import com.transportation.warehouse.model.Warehouse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {
    Warehouse toWarehouse(WarehouseRequest request);
    WarehouseResponse toWarehouseResponse(Warehouse warehouse);

    void updateWarehouseFromRequest(WarehouseRequest request,@MappingTarget Warehouse warehouse);
}
