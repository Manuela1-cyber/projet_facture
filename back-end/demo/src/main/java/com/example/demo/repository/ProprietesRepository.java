package com.example.demo.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.demo.model.Proprietes;

public interface ProprietesRepository  extends JpaRepository<Proprietes, UUID>,
                JpaSpecificationExecutor<Proprietes> {

    Optional<Proprietes> findByResidence(String residence);

}
