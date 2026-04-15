package com.example.demo.model;
import com.example.demo.model.enems.StatutFacture;
import com.example.demo.model.enems.TypeFacture;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "factures")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Facture extends BaseEntity {

    @Column(nullable = false)
    private LocalDate issuedAt;

    @Column(nullable = false)
    private LocalDate duetAt;

    @Column(nullable = false)
    private Double amount;

    @Column
    private Double ancienIndex;

    @Column
    private Double nouveauIndex;

    @Column
    private Double prixM3;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeFacture type; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFacture statut; 

    @ManyToOne
    @JoinColumn(name = "assigner_id", nullable = false)
    private Assigner assigner;
}


    