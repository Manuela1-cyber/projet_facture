package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appartement")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appartement extends BaseUUIDEntity {

    @Column(nullable = false)
    private String nom;

    @ManyToOne
    @JoinColumn(name = "locataire_id")
    private Locataires locataire;

    @ManyToOne
    @JoinColumn(name = "propriete_id", nullable = false)
    private Proprietes propriete;
    
}
