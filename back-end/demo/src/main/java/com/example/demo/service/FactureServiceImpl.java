package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.controller.payload.FactureCreateRequest;
import com.example.demo.controller.payload.FactureResponse;
import com.example.demo.controller.payload.FactureUpdateRequest;
import com.example.demo.model.Appartement;
import com.example.demo.model.Facture;
import com.example.demo.model.Locataires;
import com.example.demo.repository.AppartementRepository;
import com.example.demo.repository.FactureRepository;
import com.example.demo.repository.LocatairesRepository;

@Service
public class FactureServiceImpl implements FactureService {

    private final FactureRepository factureRepository;
    private final LocatairesRepository locatairesRepository;
    private final AppartementRepository appartementRepository;

    public FactureServiceImpl(
            FactureRepository factureRepository,
            LocatairesRepository locatairesRepository,
            AppartementRepository appartementRepository
    ) {
        this.factureRepository = factureRepository;
        this.locatairesRepository = locatairesRepository;
        this.appartementRepository = appartementRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FactureResponse> list() {
        return factureRepository.findAll().stream().map(FactureServiceImpl::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FactureResponse get(UUID id) {
        return factureRepository.findById(id).map(FactureServiceImpl::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable"));
    }

    @Override
    @Transactional
    public FactureResponse create(FactureCreateRequest request) {
        Locataires locataire = locatairesRepository.findById(request.locataireId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "locataireId invalide"));
        Appartement appartement = appartementRepository.findById(request.appartementId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "appartementId invalide"));

        Facture facture = Facture.builder()
                .issuedAt(request.issuedAt())
                .duetAt(request.duetAt())
                .amount(request.amount())
                .ancienIndex(request.ancienIndex())
                .nouveauIndex(request.nouveauIndex())
                .prixM3(request.prixM3())
                .type(request.type())
                .statut(request.statut())
                .locataire(locataire)
                .appartement(appartement)
                .build();

        return toResponse(factureRepository.save(facture));
    }

    @Override
    @Transactional
    public FactureResponse update(UUID id, FactureUpdateRequest request) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable"));

        Locataires locataire = locatairesRepository.findById(request.locataireId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "locataireId invalide"));
        Appartement appartement = appartementRepository.findById(request.appartementId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "appartementId invalide"));

        facture.setIssuedAt(request.issuedAt());
        facture.setDuetAt(request.duetAt());
        facture.setAmount(request.amount());
        facture.setAncienIndex(request.ancienIndex());
        facture.setNouveauIndex(request.nouveauIndex());
        facture.setPrixM3(request.prixM3());
        facture.setType(request.type());
        facture.setStatut(request.statut());
        facture.setLocataire(locataire);
        facture.setAppartement(appartement);

        return toResponse(factureRepository.save(facture));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!factureRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable");
        }
        factureRepository.deleteById(id);
    }

    private static FactureResponse toResponse(Facture facture) {
        UUID locataireId = facture.getLocataire() != null ? facture.getLocataire().getId() : null;
        UUID appartementId = facture.getAppartement() != null ? facture.getAppartement().getId() : null;
        return new FactureResponse(
                facture.getId(),
                facture.getIssuedAt(),
                facture.getDuetAt(),
                facture.getAmount(),
                facture.getAncienIndex(),
                facture.getNouveauIndex(),
                facture.getPrixM3(),
                facture.getType(),
                facture.getStatut(),
                locataireId,
                appartementId
        );
    }
}

