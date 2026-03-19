package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locataires")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Locataires extends BaseUUIDEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column
    private String email;

    @ManyToOne
    @JoinColumn(name = "proprietes_id", nullable = false)
    private Proprietes propriete;

}






    
   