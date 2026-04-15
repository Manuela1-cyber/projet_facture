package com.example.demo.model;

import java.time.OffsetDateTime;

import com.example.demo.model.enems.StatutAssigner;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assigner")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assigner extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "locataire_id", nullable = false)
    private Locataires locataire;

    @ManyToOne
    @JoinColumn(name = "appartement_id", nullable = false)
    private Appartement appartement;
    

    @Builder.Default()
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAssigner statut = StatutAssigner.ENTER; 

    @Column(name ="enter_at",nullable= false,updatable= false)
    private OffsetDateTime enterAt;

    @Column(name="exit_at",nullable=false)
    private OffsetDateTime exitAt;



}
