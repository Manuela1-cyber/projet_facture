package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.controller.payload.AssignerCreateRequest;
import com.example.demo.controller.payload.AssignerExitRequest;
import com.example.demo.controller.payload.AssignerResponse;
import com.example.demo.service.AssignerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assignations")
@CrossOrigin(origins = "*")
@Validated
public class AssignerController {

    private final AssignerService assignerService;

    public AssignerController(AssignerService assignerService) {
        this.assignerService = assignerService;
    }

    @GetMapping
    public List<AssignerResponse> list() {
        return assignerService.list();
    }

    @GetMapping("/{id}")
    public AssignerResponse get(@PathVariable UUID id) {
        return assignerService.get(id);
    }

    @GetMapping("/locataire/{locataireId}")
    public List<AssignerResponse> getByLocataireId(@PathVariable UUID locataireId) {
        return assignerService.getByLocataireId(locataireId);
    }

    @GetMapping("/appartement/{appartementId}")
    public List<AssignerResponse> getByAppartementId(@PathVariable UUID appartementId) {
        return assignerService.getByAppartementId(appartementId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssignerResponse create(@Valid @RequestBody AssignerCreateRequest request) {
        return assignerService.create(request);
    }

    @PutMapping("/{id}/exit")
    public AssignerResponse exit(@PathVariable UUID id, @Valid @RequestBody AssignerExitRequest request) {
        return assignerService.exit(id, request);
    }
}
