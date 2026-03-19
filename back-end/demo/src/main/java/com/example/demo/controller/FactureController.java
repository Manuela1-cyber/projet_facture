package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.controller.payload.FactureCreateRequest;
import com.example.demo.controller.payload.FactureResponse;
import com.example.demo.controller.payload.FactureUpdateRequest;
import com.example.demo.service.FactureService;
 
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "*")
@Validated
public class FactureController {

    private final FactureService factureService;

    public FactureController(FactureService factureService) {
        this.factureService = factureService;
    }

    @GetMapping
    public List<FactureResponse> list() {
        return factureService.list();
    }

    @GetMapping("/{id}")
    public FactureResponse get(@PathVariable UUID id) {
        return factureService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FactureResponse create(@Valid @RequestBody FactureCreateRequest request) {
        return factureService.create(request);
    }

    @PutMapping("/{id}")
    public FactureResponse update(@PathVariable UUID id, @Valid @RequestBody FactureUpdateRequest request) {
        return factureService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        factureService.delete(id);
    }
}

