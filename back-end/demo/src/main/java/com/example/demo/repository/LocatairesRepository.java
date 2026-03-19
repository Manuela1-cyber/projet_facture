package com.example.demo.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Locataires;



public interface LocatairesRepository 
extends JpaRepository <Locataires, UUID> {

    List<Locataires> findByPropriete_Id(UUID proprieteId);

}