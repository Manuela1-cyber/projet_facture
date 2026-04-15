package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.controller.payload.AppartementCreateRequest;
import com.example.demo.controller.payload.AppartementResponse;
import com.example.demo.controller.payload.AppartementUpdateRequest;

public interface AppartementService {
    List<AppartementResponse> list();
    AppartementResponse get(UUID id);
    AppartementResponse create(AppartementCreateRequest request);
    AppartementResponse update(UUID id, AppartementUpdateRequest request);
    void delete(UUID id);
}