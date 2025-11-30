package com.supermarket.transaction_market_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PaymentMethod {
    private String name; // "Cash", "QR"
    private Long count;
}
