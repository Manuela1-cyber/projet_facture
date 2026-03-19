package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.controller.payload.AppartementResponse;
import com.example.demo.controller.payload.LocataireResponse;
import com.example.demo.controller.payload.ProprieteResponse;
import com.example.demo.repository.AppartementRepository;
import com.example.demo.repository.LocatairesRepository;
import com.example.demo.repository.ProprietesRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReferenceDataController {

    private final LocatairesRepository locatairesRepository;
    private final AppartementRepository appartementRepository;
    private final ProprietesRepository proprietesRepository;

    public ReferenceDataController(
            LocatairesRepository locatairesRepository,
            AppartementRepository appartementRepository,
            ProprietesRepository proprietesRepository
    ) {
        this.locatairesRepository = locatairesRepository;
        this.appartementRepository = appartementRepository;
        this.proprietesRepository = proprietesRepository;
    }

    @GetMapping("/locataires")
    public List<LocataireResponse> listLocataires() {
        return locatairesRepository.findAll().stream().map(l -> new LocataireResponse(
                l.getId(),
                l.getName(),
                l.getPhone(),
                l.getEmail(),
                l.getPropriete() != null ? l.getPropriete().getId() : null
        )).collect(Collectors.toList());
    }

    @GetMapping("/appartements")
    public List<AppartementResponse> listAppartements() {
        return appartementRepository.findAll().stream().map(a -> new AppartementResponse(
                a.getId(),
                a.getNom(),
                a.getLocataire() != null ? a.getLocataire().getId() : null,
                a.getPropriete() != null ? a.getPropriete().getId() : null
        )).collect(Collectors.toList());
    }

    @GetMapping("/proprietes")
    public List<ProprieteResponse> listProprietes() {
        return proprietesRepository.findAll().stream().map(p -> new ProprieteResponse(
                p.getId(),
                p.getResidence()
        )).collect(Collectors.toList());
    }
}
