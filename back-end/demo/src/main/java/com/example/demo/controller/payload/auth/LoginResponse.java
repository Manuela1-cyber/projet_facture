package com.example.demo.controller.payload.auth;

public record LoginResponse(String accessToken, long expiresInMs, String tokenType) {
    public LoginResponse(String accessToken, long expiresInMs) {
        this(accessToken, expiresInMs, "Bearer");
    }
}

