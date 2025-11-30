package com.supermarket.transaction_market_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardReport {
    private Summary summary;
    private List<RevenueChart> revenueChart;
    private List<TopProduct> topProducts;
    private List<PaymentMethod> paymentMethods;
}
