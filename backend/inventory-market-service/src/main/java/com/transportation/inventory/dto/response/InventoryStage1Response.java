package com.transportation.inventory.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryStage1Response {
    String id;
    String sourceId;
    String productId;
    int quantity;
}
