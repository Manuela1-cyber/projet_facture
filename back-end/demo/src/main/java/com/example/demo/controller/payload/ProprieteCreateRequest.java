package com.example.demo.controller.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ProprieteCreateRequest(
        @NotBlank String residence,
        @Positive int unites
) {}

