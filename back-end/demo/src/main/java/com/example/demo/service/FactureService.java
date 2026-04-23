package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.controller.payload.FactureCreateRequest;
import com.example.demo.controller.payload.FactureResponse;
import com.example.demo.controller.payload.FactureUpdateRequest;

public interface FactureService {
    List<FactureResponse> list();
    FactureResponse get(UUID id);
    FactureResponse getForLocataire(UUID id, UUID locataireId);
    FactureResponse create(FactureCreateRequest request);
    FactureResponse update(UUID id, FactureUpdateRequest request);
    void delete(UUID id);
    void sendFactureByEmail(UUID factureId);
}

