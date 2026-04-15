package com.example.demo.repository;

import com.example.demo.model.Assigner;
import com.example.demo.model.Locataires;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignerRepository extends JpaRepository<Assigner, UUID> {
    List<Assigner> findByLocataire(Locataires locataire);

    List<Assigner> findByLocataire_Id(UUID locataireId);

    List<Assigner> findByAppartement_Id(UUID appartementId);

    boolean existsByAppartement_Id(UUID appartementId);
    
}





