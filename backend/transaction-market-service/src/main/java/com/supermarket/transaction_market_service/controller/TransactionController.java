package com.supermarket.transaction_market_service.controller;

import com.supermarket.transaction_market_service.dto.request.TransactionRequest;
import com.supermarket.transaction_market_service.dto.response.DashboardReport;
import com.supermarket.transaction_market_service.dto.response.DateGroupResponse;
import com.supermarket.transaction_market_service.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping("/create")
    public void createTransaction(@RequestBody TransactionRequest request){
        transactionService.createTransaction(request);
    }

    /**
     * Get transaction history for a date range
     * GET /api/transactions/history?startDate=2024-11-01&endDate=2024-11-30
     */
    @GetMapping("/history")
    public ResponseEntity<List<DateGroupResponse>> getTransactionHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<DateGroupResponse> history = transactionService
                .getTransactionHistory(startDate, endDate);
        return ResponseEntity.ok(history);
    }

    /**
     * Get all transaction history (last 90 days by default)
     * GET /api/transactions/history/all
     */
    @GetMapping("/history/all")
    public ResponseEntity<List<DateGroupResponse>> getAllTransactionHistory() {
        List<DateGroupResponse> history = transactionService
                .getRecentTransactionHistory(90);
        return ResponseEntity.ok(history);
    }

    // DASH BOARD
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardReport> getDashboardReport(
            @RequestParam String filterType, // "month" or "year"
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        DashboardReport report = transactionService.getDashboardReport(filterType, month, year);
        return ResponseEntity.ok(report);
    }
}
