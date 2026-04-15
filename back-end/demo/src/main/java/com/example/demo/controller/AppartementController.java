package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.controller.payload.AppartementCreateRequest;
import com.example.demo.controller.payload.AppartementResponse;
import com.example.demo.controller.payload.AppartementUpdateRequest;
import com.example.demo.service.AppartementService;
 
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appartements")
@CrossOrigin(origins = "*")
@Validated
public class AppartementController {

    private final AppartementService appartementService;

    public AppartementController(AppartementService appartementService) {
        this.appartementService = appartementService;
    }

    @GetMapping
    public List<AppartementResponse> list() {
        return appartementService.list();
    }

    @GetMapping("/{id}")
    public AppartementResponse get(@PathVariable UUID id) {
        return appartementService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppartementResponse create(@Valid @RequestBody AppartementCreateRequest request) {
        return appartementService.create(request);
    }

    @PutMapping("/{id}")
    public AppartementResponse update(@PathVariable UUID id, @Valid @RequestBody AppartementUpdateRequest request) {
        return appartementService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        appartementService.delete(id);
    }
}


