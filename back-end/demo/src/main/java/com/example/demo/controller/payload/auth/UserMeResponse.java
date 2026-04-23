package com.example.demo.controller.payload.auth;

import java.util.UUID;

import com.example.demo.model.User;
import com.example.demo.model.enems.UserRole;

public record UserMeResponse(UUID id, String name, String email, UserRole role) {
    public static UserMeResponse from(User user) {
        return new UserMeResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}

