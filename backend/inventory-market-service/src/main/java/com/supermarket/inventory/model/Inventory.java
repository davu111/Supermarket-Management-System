package com.transportation.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String sourceId; //ORDER ID, WAREHOUSE ID
    String productId;

    @Column(nullable = false)
    Double quantity;
}


