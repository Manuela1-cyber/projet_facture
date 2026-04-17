package com.example.demo.controller.payload;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;

public record AssignerExitRequest(
        @NotNull OffsetDateTime exitAt
) {}
