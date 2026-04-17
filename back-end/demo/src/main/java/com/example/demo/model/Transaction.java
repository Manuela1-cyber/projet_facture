package com.example.demo.model;

import java.util.UUID;
import com.example.demo.model.enems.TransactionType;
import com.example.demo.service.FactureService;
import com.example.demo.model.enems.TransactionStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transactions")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends BaseEntity {

    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String sessionToken;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;



    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String metaData;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String response;

    @ManyToOne
    @JoinColumn(name = "factures_id", nullable = false)
    private Facture facture;
}
