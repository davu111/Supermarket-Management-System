package com.transportation.product.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    @Id
    String id;
    String name;
    String description;
    BigDecimal price;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
