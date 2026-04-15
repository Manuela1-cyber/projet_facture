package com.example.demo.controller.payload;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AppartementCreateRequest(
        @NotBlank String nom,
        UUID locataireId,
        @NotNull UUID proprieteId
) {}


