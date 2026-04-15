package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.controller.payload.LocataireCreateRequest;
import com.example.demo.controller.payload.LocataireResponse;
import com.example.demo.controller.payload.LocataireUpdateRequest;

public interface LocataireService {
    List<LocataireResponse> list();
    LocataireResponse get(UUID id);
    LocataireResponse create(LocataireCreateRequest request);
    LocataireResponse update(UUID id, LocataireUpdateRequest request);
    void delete(UUID id);
}