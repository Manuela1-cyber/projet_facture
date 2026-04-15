package com.example.demo.controller.payload;

import java.time.LocalDate;
import java.util.UUID;

import com.example.demo.model.enems.StatutFacture;
import com.example.demo.model.enems.TypeFacture;

import jakarta.validation.constraints.NotNull;

public record FactureUpdateRequest(
        @NotNull LocalDate issuedAt,
        @NotNull LocalDate duetAt,
        @NotNull Double amount,
        Double ancienIndex,
        Double nouveauIndex,
        Double prixM3,
        @NotNull TypeFacture type,
        @NotNull StatutFacture statut,
        @NotNull UUID assignerId
) {}

