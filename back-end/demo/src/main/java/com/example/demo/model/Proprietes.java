package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proprietes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Proprietes extends BaseUUIDEntity { 

    @Column(nullable = false)
    private String residence;

    @Column(nullable = false)
    private int unites;

} 

    
    
