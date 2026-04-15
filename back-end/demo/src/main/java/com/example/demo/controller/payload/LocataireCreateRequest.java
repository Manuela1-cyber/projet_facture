package com.example.demo.controller.payload;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LocataireCreateRequest(
        @NotBlank String name,
        @NotBlank String phone,
        String email,
        @NotNull UUID proprieteId
) {}