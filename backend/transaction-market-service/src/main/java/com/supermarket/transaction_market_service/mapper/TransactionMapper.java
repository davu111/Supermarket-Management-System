package com.supermarket.transaction_market_service.mapper;

import com.supermarket.transaction_market_service.dto.response.TransactionResponse;
import com.supermarket.transaction_market_service.model.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TransactionItemMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TransactionMapper {

    @Mapping(target = "createdAt", source = "createdAt", dateFormat = "yyyy-MM-dd")
    @Mapping(target = "items", ignore = true) // Will be set manually
    TransactionResponse toResponse(Transaction transaction);

    List<TransactionResponse> toResponseList(List<Transaction> transactions);
}
