package com.example.demo.controller.payload;

import java.util.UUID;

public record LocataireResponse(
        UUID id,
        String name,
        String phone,
        String email,
        UUID proprieteId
) {}