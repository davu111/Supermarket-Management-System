package com.supermarket.transaction_market_service.mapper;

import com.supermarket.transaction_market_service.dto.response.TransactionItemResponse;
import com.supermarket.transaction_market_service.model.TransactionItem;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TransactionItemMapper {

    TransactionItemResponse toResponse(TransactionItem item);

    List<TransactionItemResponse> toResponseList(List<TransactionItem> items);
}
