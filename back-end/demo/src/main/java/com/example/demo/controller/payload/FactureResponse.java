package com.example.demo.controller.payload;

import java.time.LocalDate;
import java.util.UUID;

import com.example.demo.model.enems.StatutFacture;
import com.example.demo.model.enems.TypeFacture;

public record FactureResponse(
        UUID id,
        LocalDate issuedAt,
        LocalDate duetAt,
        Double amount,
        Double ancienIndex,
        Double nouveauIndex,
        Double prixM3,
        TypeFacture type,
        StatutFacture statut,
        UUID locataireId,
        UUID appartementId
) {}
