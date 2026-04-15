package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.controller.payload.LocataireCreateRequest;
import com.example.demo.controller.payload.LocataireResponse;
import com.example.demo.controller.payload.LocataireUpdateRequest;
import com.example.demo.service.LocataireService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/locataires")
@CrossOrigin(origins = "*")
@Validated
public class LocataireController {

    private final LocataireService locataireService;

    public LocataireController(LocataireService locataireService) {
        this.locataireService = locataireService;
    }

    @GetMapping
    public List<LocataireResponse> list() {
        return locataireService.list();
    }

    @GetMapping("/{id}")
    public LocataireResponse get(@PathVariable UUID id) {
        return locataireService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocataireResponse create(@Valid @RequestBody LocataireCreateRequest request) {
        return locataireService.create(request);
    }

    @PutMapping("/{id}")
    public LocataireResponse update(@PathVariable UUID id, @Valid @RequestBody LocataireUpdateRequest request) {
        return locataireService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        locataireService.delete(id);
    }
}