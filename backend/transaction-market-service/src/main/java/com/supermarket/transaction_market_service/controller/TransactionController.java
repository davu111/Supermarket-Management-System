package com.supermarket.transaction_market_service.controller;

import com.supermarket.transaction_market_service.dto.request.TransactionRequest;
import com.supermarket.transaction_market_service.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping("/create")
    public void createTransaction(@RequestBody TransactionRequest request){
        transactionService.createTransaction(request);
    }
}
