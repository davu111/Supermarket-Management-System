package com.supermarket.transaction_market_service.service;

import com.supermarket.transaction_market_service.dto.request.TransactionRequest;
import com.supermarket.transaction_market_service.dto.response.*;
import com.supermarket.transaction_market_service.mapper.TransactionItemMapper;
import com.supermarket.transaction_market_service.mapper.TransactionMapper;
import com.supermarket.transaction_market_service.model.Transaction;
import com.supermarket.transaction_market_service.model.TransactionItem;
import com.supermarket.transaction_market_service.repository.TransactionItemRepository;
import com.supermarket.transaction_market_service.repository.TransactionRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;
    private final TransactionMapper transactionMapper;
    private final TransactionItemMapper transactionItemMapper;
    private final WebClient webClient;

    public TransactionService(TransactionRepository transactionRepository,
                              TransactionItemRepository transactionItemRepository,
                              TransactionMapper transactionMapper,
                              TransactionItemMapper transactionItemMapper,
                              WebClient.Builder webClientBuilder) {
        this.transactionRepository = transactionRepository;
        this.transactionItemRepository = transactionItemRepository;
        this.transactionMapper = transactionMapper;
        this.transactionItemMapper = transactionItemMapper;
        this.webClient = webClientBuilder.baseUrl("http://localhost:9000/api").build();
    }

    // CREATE TRANSACTION
    public void createTransaction(TransactionRequest request) {
        String tokenValue = getToken();
        String cardNumber = request.getCardNumber();
        Long customerId;

        System.out.print(cardNumber);
        if (cardNumber == null || cardNumber.isEmpty()) {
            customerId = 99999L; // Default guest customer ID
        } else {
            customerId = webClient.get()
                    .uri("/customers/getIdByCardNumber/{cardNumber}", request.getCardNumber())
                    .headers(headers -> {
                        assert tokenValue != null;
                        headers.setBearerAuth(tokenValue);
                    })
                    .retrieve()
                    .bodyToMono(Long.class)
                    .block();
        }

        Transaction transaction = Transaction.builder()
                .customerId(customerId)
                .total(request.getTotal())
                .paymentMethod(request.getPaymentMethod())
                .createdAt(LocalDate.now())
                .build();

        transactionRepository.save(transaction);

        request.getItems().forEach(item -> {
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
        // Update customer points
        assert customerId != null;
        if (customerId.equals(99999L)) {
            return; // Skip for guest customer
        }
        Integer rewardPoints = (int) request.getTotal().longValue() / 100000;
        Integer tierPoints = (int) request.getTotal().longValue() / 200000;    // 1 points per 200.000d spent

        webClient.put()
                .uri(uriBuilder -> uriBuilder
                        .path("/customers/addPoints/{customerId}")
                        .queryParam("rewardPoints", rewardPoints)
                        .queryParam("tierPoints", tierPoints)
                        .build(customerId))
                .headers(headers -> {
                    assert tokenValue != null;
                    headers.setBearerAuth(tokenValue);
                })
                .retrieve()
                .bodyToMono(Long.class)
                .block();
    }

    // GET ALL TRANSACTIONS
    public List<DateGroupResponse> getTransactionHistory(LocalDate startDate, LocalDate endDate) {
        // Get all transactions in date range
        List<Transaction> transactions = transactionRepository
                .findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);

        if (transactions.isEmpty()) {
            return new ArrayList<>();
        }

        // Get all transaction IDs
        List<Long> transactionIds = transactions.stream()
                .map(Transaction::getId)
                .collect(Collectors.toList());

        // Get all transaction items
        List<TransactionItem> allItems = transactionItemRepository
                .findByTransactionIdIn(transactionIds);

        // Group items by transaction ID using MapStruct
        Map<Long, List<TransactionItemResponse>> itemsByTransaction = allItems.stream()
                .collect(Collectors.groupingBy(
                        TransactionItem::getTransactionId,
                        Collectors.mapping(
                                transactionItemMapper::toResponse,
                                Collectors.toList()
                        )
                ));

        // Get all unique customer IDs
        List<Long> customerIds = transactions.stream()
                .map(Transaction::getCustomerId)
                .distinct()
                .toList();

        // Group transactions by date
        Map<LocalDate, List<Transaction>> transactionsByDate = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getCreatedAt));

        // Build response structure
        return transactionsByDate.entrySet().stream()
                .map(dateEntry -> {
                    DateGroupResponse dateGroup = new DateGroupResponse();
                    dateGroup.setDate(dateEntry.getKey().toString());

                    // Group by customer
                    Map<Long, List<Transaction>> transactionsByCustomer = dateEntry.getValue()
                            .stream()
                            .collect(Collectors.groupingBy(Transaction::getCustomerId));

                    List<CustomerTransactionResponse> customerResponses = transactionsByCustomer.entrySet()
                            .stream()
                            .map(customerEntry -> {
                                CustomerTransactionResponse customerResponse = new CustomerTransactionResponse();
                                customerResponse.setCustomerId(customerEntry.getKey());

                                // Map transactions using MapStruct
                                List<TransactionResponse> transactionResponses = customerEntry.getValue()
                                        .stream()
                                        .map(transaction -> {
                                            TransactionResponse dto = transactionMapper.toResponse(transaction);
                                            // Set items from pre-mapped collection
                                            dto.setItems(itemsByTransaction.getOrDefault(
                                                    transaction.getId(),
                                                    new ArrayList<>()
                                            ));
                                            return dto;
                                        })
                                        .collect(Collectors.toList());

                                customerResponse.setTransactions(transactionResponses);
                                return customerResponse;
                            })
                            .collect(Collectors.toList());

                    dateGroup.setCustomers(customerResponses);
                    return dateGroup;
                })
                .sorted(Comparator.comparing(DateGroupResponse::getDate).reversed())
                .collect(Collectors.toList());
    }

    public List<DateGroupResponse> getRecentTransactionHistory(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        return getTransactionHistory(startDate, endDate);
    }

    public DashboardReport getDashboardReport(String filterType, Integer month, Integer year) {
        LocalDate startDate, endDate;

        if ("month".equals(filterType)) {
            YearMonth yearMonth = YearMonth.of(year, month);
            startDate = yearMonth.atDay(1);
            endDate = yearMonth.atEndOfMonth();
        } else {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        }

        return DashboardReport.builder()
                .summary(getSummary(startDate, endDate))
                .revenueChart(getRevenueChart(startDate, endDate, filterType))
                .topProducts(getTopProducts(startDate, endDate))
                .paymentMethods(getPaymentMethods(startDate, endDate))
                .build();
    }

    private Summary getSummary(LocalDate startDate, LocalDate endDate) {
        var transactions = transactionRepository.findByCreatedAtBetween(startDate, endDate);

        BigDecimal totalRevenue = transactions.stream()
                .map(Transaction::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalTransactions = (long) transactions.size();

        Long totalProducts = transactionItemRepository
                .findByTransactionIdIn(transactions.stream().map(Transaction::getId).collect(Collectors.toList()))
                .stream()
                .mapToLong(TransactionItem::getQuantity)
                .sum();

        BigDecimal avgOrderValue = totalTransactions > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return Summary.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTransactions)
                .totalProducts(totalProducts)
                .averageOrderValue(avgOrderValue)
                .build();
    }

    private List<RevenueChart> getRevenueChart(LocalDate startDate, LocalDate endDate, String filterType) {
        var transactions = transactionRepository.findByCreatedAtBetween(startDate, endDate);

        Map<String, BigDecimal> revenueMap = new HashMap<>();

        if ("month".equals(filterType)) {
            // Group by day
            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                revenueMap.put("Day " + date.getDayOfMonth(), BigDecimal.ZERO);
            }

            for (var transaction : transactions) {
                String key = "Day " + transaction.getCreatedAt().getDayOfMonth();
                revenueMap.merge(key, transaction.getTotal(), BigDecimal::add);
            }
        } else {
            // Group by month
            for (int m = 1; m <= 12; m++) {
                LocalDate monthDate = LocalDate.of(startDate.getYear(), m, 1);
                revenueMap.put(monthDate.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), BigDecimal.ZERO);
            }

            for (var transaction : transactions) {
                String key = transaction.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                revenueMap.merge(key, transaction.getTotal(), BigDecimal::add);
            }
        }

        return revenueMap.entrySet().stream()
                .map(entry -> RevenueChart.builder()
                        .period(entry.getKey())
                        .revenue(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<TopProduct> getTopProducts(LocalDate startDate, LocalDate endDate) {
        var transactions = transactionRepository.findByCreatedAtBetween(startDate, endDate);
        var transactionIds = transactions.stream().map(Transaction::getId).collect(Collectors.toList());
        var items = transactionItemRepository.findByTransactionIdIn(transactionIds);

        Map<String, TopProduct> productMap = new HashMap<>();

        for (var item : items) {
            productMap.merge(
                    item.getProductName(),
                    TopProduct.builder()
                            .productName(item.getProductName())
                            .totalQuantity((long) item.getQuantity())
                            .totalRevenue(item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build(),
                    (existing, newVal) -> TopProduct.builder()
                            .productName(existing.getProductName())
                            .totalQuantity(existing.getTotalQuantity() + newVal.getTotalQuantity())
                            .totalRevenue(existing.getTotalRevenue().add(newVal.getTotalRevenue()))
                            .build()
            );
        }

        return productMap.values().stream()
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<PaymentMethod> getPaymentMethods(LocalDate startDate, LocalDate endDate) {
        var transactions = transactionRepository.findByCreatedAtBetween(startDate, endDate);

        Map<String, Long> methodCount = transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getPaymentMethod,
                        Collectors.counting()
                ));

        return methodCount.entrySet().stream()
                .map(entry -> PaymentMethod.builder()
                        .name(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    public String getToken() {
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
