package com.example.demo.controller.payload;

import java.util.UUID;

public record ProprieteResponse(
        UUID id,
        String residence
) {}