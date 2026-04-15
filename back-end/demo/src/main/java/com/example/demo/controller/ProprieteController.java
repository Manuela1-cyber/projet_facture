package com.example.demo.controller;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.controller.payload.ProprieteCreateRequest;
import com.example.demo.controller.payload.ProprieteResponse;
import com.example.demo.controller.payload.ProprieteUpdateRequest;
import com.example.demo.service.ProprieteService;
 
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/proprietes")
@CrossOrigin(origins = "*")
@Validated

public class ProprieteController {
     private final ProprieteService proprieteService;

    public ProprieteController(ProprieteService proprieteService) {
        this.proprieteService = proprieteService;
    }

    @GetMapping
    public List<ProprieteResponse> list() {
        return proprieteService.list();
    }

    @GetMapping("/{id}")
    public ProprieteResponse get(@PathVariable UUID id) {
        return proprieteService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProprieteResponse create(@Valid @RequestBody ProprieteCreateRequest request) {
        return proprieteService.create(request);
    }

    @PutMapping("/{id}")
    public ProprieteResponse update(@PathVariable UUID id, @Valid @RequestBody ProprieteUpdateRequest request) {
        return proprieteService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        proprieteService.delete(id);
    }
    
}

 