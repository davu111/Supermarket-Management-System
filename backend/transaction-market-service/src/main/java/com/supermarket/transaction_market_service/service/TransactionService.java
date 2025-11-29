package com.supermarket.transaction_market_service.service;

import com.supermarket.transaction_market_service.dto.request.TransactionRequest;
import com.supermarket.transaction_market_service.model.Transaction;
import com.supermarket.transaction_market_service.model.TransactionItem;
import com.supermarket.transaction_market_service.repository.TransactionItemRepository;
import com.supermarket.transaction_market_service.repository.TransactionRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;
    private final WebClient webClient;

    public TransactionService(TransactionRepository transactionRepository, TransactionItemRepository transactionItemRepository, WebClient.Builder webClientBuilder) {
        this.transactionRepository = transactionRepository;
        this.transactionItemRepository = transactionItemRepository;
        this.webClient = webClientBuilder.baseUrl("http://localhost:9000/api").build();
    }

    // CREATE TRANSACTION
    public void createTransaction(TransactionRequest request) {
        String tokenValue = getToken();

        Long customerId = webClient.get()
                .uri("/customers/getIdByCardNumber/{cardNumber}", request.getCardNumber())
                .headers(headers -> {
                    assert tokenValue != null;
                    headers.setBearerAuth(tokenValue);
                })
                .retrieve()
                .bodyToMono(Long.class)
                .block();

        Transaction transaction = Transaction.builder()
                .customerId(customerId)
                .total(request.getTotal())
                .paymentMethod(request.getPaymentMethod())
                .createdAt(LocalDate.now())
                .build();

        transactionRepository.save(transaction);

        request.getItems().forEach(item ->  {
            TransactionItem transactionItem = TransactionItem.builder()
                    .productId(item.getId())
                    .productName(item.getName())
                    .quantity(item.getQuantity())
                    .priceAtTime(item.getPrice())
                    .transactionId(transaction.getId())
                    .build();

            webClient.put()
                    .uri(uriBuilder -> uriBuilder
                            .path("/inventory/reduceInventory/{productId}")
                            .queryParam("quantity", item.getQuantity())
                            .build(item.getId()))
                    .headers(headers -> {
                        assert tokenValue != null;
                        headers.setBearerAuth(tokenValue);
                    })
                    .retrieve()
                    .bodyToMono(Long.class)
                    .block();

            transactionItemRepository.save(transactionItem);
        });
    }

    public String getToken(){
        // 🔸 Lấy token từ SecurityContext
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String tokenValue;

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            tokenValue = jwtAuth.getToken().getTokenValue();
        } else {
            tokenValue = null;
        }
        return tokenValue;
    }
}
