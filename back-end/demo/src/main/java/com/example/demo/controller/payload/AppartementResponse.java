package com.example.demo.controller.payload;

import java.util.UUID;

public record AppartementResponse(
        UUID id,
        String nom,
        UUID locataireId,
        UUID proprieteId
) {}