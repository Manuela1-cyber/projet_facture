package com.example.demo.controller.payload;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AssignerCreateRequest(
        @NotNull UUID locataireId,
        @NotNull UUID appartementId
) {}
