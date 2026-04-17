package com.example.demo.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.demo.controller.payload.AssignerCreateRequest;
import com.example.demo.controller.payload.AssignerExitRequest;
import com.example.demo.controller.payload.AssignerResponse;

public interface AssignerService {
    List<AssignerResponse> list();
    
    AssignerResponse get(UUID id);
    
    List<AssignerResponse> getByLocataireId(UUID locataireId);
    
    List<AssignerResponse> getByAppartementId(UUID appartementId);
    
    AssignerResponse create(AssignerCreateRequest request);
    
    AssignerResponse exit(UUID id, AssignerExitRequest request);
}
