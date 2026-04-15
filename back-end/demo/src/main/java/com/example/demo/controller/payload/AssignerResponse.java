package com.example.demo.controller.payload;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.demo.model.enems.StatutAssigner;

public record AssignerResponse(
        UUID id,
        UUID locataireId,
        UUID appartementId,
        StatutAssigner statut,
        OffsetDateTime enterAt,
        OffsetDateTime exitAt
) {}
