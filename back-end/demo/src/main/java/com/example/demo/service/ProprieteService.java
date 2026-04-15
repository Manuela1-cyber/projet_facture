package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.controller.payload.ProprieteCreateRequest;
import com.example.demo.controller.payload.ProprieteResponse;
import com.example.demo.controller.payload.ProprieteUpdateRequest;

public interface ProprieteService { 
    List<ProprieteResponse> list();
    ProprieteResponse get(UUID id);
    ProprieteResponse create(ProprieteCreateRequest request);
    ProprieteResponse update(UUID id, ProprieteUpdateRequest request);
    void delete(UUID id);
}
