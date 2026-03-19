package com.example.demo.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Appartement;

@Repository
public interface AppartementRepository extends JpaRepository<Appartement, UUID> {
    List<Appartement> findByLocataire_Id(UUID locataireId);
    List<Appartement> findByPropriete_Id(UUID proprieteId);
}
