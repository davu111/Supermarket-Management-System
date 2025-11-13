package com.supermarket.coupon_market_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermarket.coupon_market_service.dto.request.ApplyCouponRequest;
import com.supermarket.coupon_market_service.dto.response.ApplyCouponResponse;
import com.supermarket.coupon_market_service.dto.response.CouponDetail;
import com.supermarket.coupon_market_service.dto.response.ProductResponse;
import com.supermarket.coupon_market_service.model.Coupon;
import com.supermarket.coupon_market_service.model.CouponType;
import com.supermarket.coupon_market_service.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    public CouponService(CouponRepository couponRepository, ObjectMapper objectMapper, WebClient.Builder webClientBuilder) {
        this.couponRepository = couponRepository;
        this.objectMapper = objectMapper;
        this.webClient = webClientBuilder.baseUrl("http://localhost:9000/api").build();
    }

    public ApplyCouponResponse applyCoupons(ApplyCouponRequest request) {
        String tokenValue = getToken();

        // 1. Lấy thông tin sản phẩm
        List<ProductResponse> products = webClient.post()
                .uri("/products/getListProducts")
                .headers(headers -> {
                    assert tokenValue != null;
                    headers.setBearerAuth(tokenValue);
                }) // ✅ Gắn Authorization header
                .bodyValue(request.getProductIds())
                .retrieve()
                .bodyToFlux(ProductResponse.class)
                .collectList()
                .block();

        assert products != null;
        if (products.isEmpty()) {
            return ApplyCouponResponse.builder()
                    .coupons(Collections.emptyList())
                    .totalDiscount(BigDecimal.ZERO)
                    .originalTotal(BigDecimal.ZERO)
                    .finalTotal(BigDecimal.ZERO)
                    .build();
        }

        // 2. Tính tổng tiền ban đầu
        BigDecimal originalTotal = request.getTotalAmount();
        if (originalTotal == null) {
            originalTotal = products.stream()
                    .map(ProductResponse::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        // 3. Lấy tất cả coupon active
        List<Coupon> activeCoupons = couponRepository.findAllActiveCoupons(LocalDateTime.now());

        // 4. Áp dụng logic chọn coupon
        List<CouponDetail> appliedCoupons = new ArrayList<>();

        // 4a. COMBO - chọn giá trị cao nhất
        findBestComboCoupon(products, activeCoupons)
                .ifPresent(appliedCoupons::add);

        // 4b. TOTAL - chọn giá trị cao nhất
        findBestTotalCoupon(originalTotal, activeCoupons)
                .ifPresent(appliedCoupons::add);

        // 4c. HOLIDAY - chọn giá trị cao nhất
        findBestHolidayCoupon(activeCoupons)
                .ifPresent(appliedCoupons::add);

        // 4d. PRODUCT - áp dụng TẤT CẢ sản phẩm thỏa mãn
        appliedCoupons.addAll(findAllProductCoupons(products, activeCoupons));

        // 5. Tính tổng giảm giá và giá cuối cùng
        BigDecimal totalDiscount = appliedCoupons.stream()
                .map(CouponDetail::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal finalTotal = originalTotal.subtract(totalDiscount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        return ApplyCouponResponse.builder()
                .coupons(appliedCoupons)
                .totalDiscount(totalDiscount)
                .originalTotal(originalTotal)
                .finalTotal(finalTotal)
                .build();
    }

    // Tìm coupon COMBO tốt nhất
    private Optional<CouponDetail> findBestComboCoupon(List<ProductResponse> products, List<Coupon> coupons) {
        return coupons.stream()
                .filter(c -> c.getType() == CouponType.COMBO)
                .filter(c -> isComboApplicable(products, c))
                .max(Comparator.comparing(Coupon::getAmount)
                        .thenComparing(Coupon::getPriority))
                .map(this::toCouponDetail);
    }

    // Kiểm tra combo có áp dụng được không
    private boolean isComboApplicable(List<ProductResponse> products, Coupon coupon) {
        try {
            List<String> requiredCodes = parseJsonArray(coupon.getComboProductCodes());
            if (requiredCodes.isEmpty()) return false;

            Set<String> productCodes = products.stream()
                    .map(ProductResponse::getProductCode)
                    .collect(Collectors.toSet());

            // Kiểm tra pattern matching cho mỗi required code
            for (String requiredCode : requiredCodes) {
                boolean found = productCodes.stream()
                        .anyMatch(pc -> matchesPattern(pc, requiredCode));
                if (!found) return false;
            }
            return true;

        } catch (Exception e) {
            log.error("Error checking combo applicability", e);
            return false;
        }
    }

    // Tìm coupon TOTAL tốt nhất
    private Optional<CouponDetail> findBestTotalCoupon(BigDecimal totalAmount, List<Coupon> coupons) {
        return coupons.stream()
                .filter(c -> c.getType() == CouponType.TOTAL)
                .filter(c -> isTotalApplicable(totalAmount, c))
                .max(Comparator.comparing(this::calculateTotalDiscount)
                        .thenComparing(Coupon::getPriority))
                .map(c -> toCouponDetailWithCalculatedAmount(c, totalAmount));
    }

    private boolean isTotalApplicable(BigDecimal totalAmount, Coupon coupon) {
        return coupon.getMinOrderAmount() == null ||
                totalAmount.compareTo(coupon.getMinOrderAmount()) >= 0;
    }

    private BigDecimal calculateTotalDiscount(Coupon coupon) {
        // Ưu tiên amount cố định, nếu không có thì dùng percentage
        if (coupon.getAmount() != null && coupon.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            return coupon.getAmount();
        }
        return BigDecimal.ZERO; // Percentage sẽ được tính trong toCouponDetailWithCalculatedAmount
    }

    // Tìm coupon HOLIDAY tốt nhất
    private Optional<CouponDetail> findBestHolidayCoupon(List<Coupon> coupons) {
        LocalDateTime now = LocalDateTime.now();
        return coupons.stream()
                .filter(c -> c.getType() == CouponType.HOLIDAY)
                .filter(c -> isHolidayApplicable(now, c))
                .max(Comparator.comparing(Coupon::getAmount)
                        .thenComparing(Coupon::getPriority))
                .map(this::toCouponDetail);
    }

    private boolean isHolidayApplicable(LocalDateTime now, Coupon coupon) {
        return (coupon.getHolidayStartDate() == null || !now.isBefore(coupon.getHolidayStartDate())) &&
                (coupon.getHolidayEndDate() == null || !now.isAfter(coupon.getHolidayEndDate()));
    }

    // Tìm TẤT CẢ coupon PRODUCT áp dụng được
    private List<CouponDetail> findAllProductCoupons(List<ProductResponse> products, List<Coupon> coupons) {
        return coupons.stream()
                .filter(c -> c.getType() == CouponType.PRODUCT)
                .map(c -> applyProductCoupon(products, c))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    private Optional<CouponDetail> applyProductCoupon(List<ProductResponse> products, Coupon coupon) {
        try {
            List<String> applicableCodes = parseProductCodes(coupon.getApplicableProductCodes());
            String pattern = coupon.getProductCodePattern();

            List<String> matchedProductCodes = products.stream()
                    .filter(p -> isProductMatch(p, applicableCodes, pattern))
                    .map(ProductResponse::getProductCode)
                    .toList();

            if (matchedProductCodes.isEmpty()) {
                return Optional.empty();
            }

            // Tính tổng giảm giá cho tất cả sản phẩm match
            BigDecimal totalDiscount = BigDecimal.valueOf(matchedProductCodes.size())
                    .multiply(coupon.getAmount());

            return Optional.of(CouponDetail.builder()
                    .type(coupon.getType().name().toLowerCase())
                    .name(coupon.getName())
                    .amount(totalDiscount)
                    .description(coupon.getDescription())
                    .appliedProductCodes(matchedProductCodes)
                    .build());

        } catch (Exception e) {
            log.error("Error applying product coupon", e);
            return Optional.empty();
        }
    }

    private boolean isProductMatch(ProductResponse product, List<String> applicableCodes, String pattern) {
        // Kiểm tra theo ID
        if (!applicableCodes.isEmpty() && applicableCodes.contains(product.getProductCode())) {
            return true;
        }
        // Kiểm tra theo pattern
        if (pattern != null && !pattern.isEmpty()) {
            return matchesPattern(product.getProductCode(), pattern);
        }
        return false;
    }

    private boolean matchesPattern(String productCode, String pattern) {
        // Hỗ trợ wildcard đơn giản: "SUA*" -> "SUA.*"
        String regexPattern = pattern.replace("*", ".*");
        return Pattern.matches(regexPattern, productCode);
    }

    // Helper methods
    private CouponDetail toCouponDetail(Coupon coupon) {
        return CouponDetail.builder()
                .type(coupon.getType().name().toLowerCase())
                .name(coupon.getName())
                .amount(coupon.getAmount())
                .description(coupon.getDescription())
                .build();
    }

    private CouponDetail toCouponDetailWithCalculatedAmount(Coupon coupon, BigDecimal totalAmount) {
        BigDecimal discountAmount = coupon.getAmount();

        // Nếu có percentage discount, tính theo %
        if (coupon.getPercentageDiscount() != null &&
                coupon.getPercentageDiscount().compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = totalAmount
                    .multiply(coupon.getPercentageDiscount())
                    .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
        }

        return CouponDetail.builder()
                .type(coupon.getType().name().toLowerCase())
                .name(coupon.getName())
                .amount(discountAmount)
                .description(coupon.getDescription())
                .build();
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            // Thử parse JSON array
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            // Fallback: comma-separated
            return Arrays.asList(json.split(","));
        }
    }

    private List<String> parseProductCodes(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
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
