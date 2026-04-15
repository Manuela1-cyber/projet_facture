package com.example.demo.controller.payload;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ProprieteUpdateRequest(
        @NotBlank String residence,
        @Positive int unites,
        List<UUID> appartementIdsToDelete
) {}
