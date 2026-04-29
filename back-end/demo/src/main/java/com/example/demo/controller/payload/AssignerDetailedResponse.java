package com.example.demo.controller.payload;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.demo.model.enems.StatutAssigner;

public record AssignerDetailedResponse(
        UUID id,
        LocalataireResponse locataire,
        AppartementSimpleResponse appartement,
        StatutAssigner statut,
        OffsetDateTime enterAt,
        OffsetDateTime exitAt
) {
    public record LocalataireResponse(
            UUID id,
            String name,
            String phone,
            String email
    ) {}

    public record AppartementSimpleResponse(
            UUID id,
            String nom
    ) {}
}
