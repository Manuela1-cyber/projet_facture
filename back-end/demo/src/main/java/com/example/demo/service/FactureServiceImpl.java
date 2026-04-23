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
import com.example.demo.model.Assigner;
import com.example.demo.model.Facture;
import com.example.demo.repository.AssignerRepository;
import com.example.demo.repository.FactureRepository;


@Service
public class FactureServiceImpl implements FactureService {

    private final FactureRepository factureRepository;
    private final AssignerRepository assignerRepository;
    private final EmailService emailService;
 

    public FactureServiceImpl(
            FactureRepository factureRepository,
            AssignerRepository assignerRepository,
            EmailService emailService
        
    ) {
        this.factureRepository = factureRepository;
        this.assignerRepository = assignerRepository;
        this.emailService = emailService;
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
    @Transactional(readOnly = true)
    public FactureResponse getForLocataire(UUID id, UUID locataireId) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable"));

        UUID factureLocataireId = facture.getAssigner() != null
                && facture.getAssigner().getLocataire() != null
                        ? facture.getAssigner().getLocataire().getId()
                        : null;

        if (factureLocataireId == null || !factureLocataireId.equals(locataireId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable pour ce locataire");
        }

        return toResponse(facture);
    }

    @Override
    @Transactional
    public FactureResponse create(FactureCreateRequest request) {
        Assigner assigner = assignerRepository.findById(request.assignerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "assignerId invalide"));
        

        Facture facture = Facture.builder()
                .issuedAt(request.issuedAt())
                .duetAt(request.duetAt())
                .amount(request.amount())
                .ancienIndex(request.ancienIndex())
                .nouveauIndex(request.nouveauIndex())
                .prixM3(request.prixM3())
                .type(request.type())
                .statut(request.statut())
                .assigner(assigner)
                .build();

        return toResponse(factureRepository.save(facture));
    }

    @Override
    @Transactional
    public FactureResponse update(UUID id, FactureUpdateRequest request) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable"));
        Assigner assigner = assignerRepository.findById(request.assignerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "assignerId invalide"));
        facture.setIssuedAt(request.issuedAt());
        facture.setDuetAt(request.duetAt());
        facture.setAmount(request.amount());
        facture.setAncienIndex(request.ancienIndex());
        facture.setNouveauIndex(request.nouveauIndex());
        facture.setPrixM3(request.prixM3());
        facture.setType(request.type());
        facture.setStatut(request.statut());
        facture.setAssigner(assigner);
       

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

    @Override
    @Transactional(readOnly = true)
    public void sendFactureByEmail(UUID factureId) {
        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable"));
        
        String locataireEmail = facture.getAssigner().getLocataire().getEmail();
        
        if (locataireEmail == null || locataireEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email du locataire non disponible");
        }
        
        emailService.sendFactureConfirmationEmail(locataireEmail, facture);
    }

    private static FactureResponse toResponse(Facture facture) {
        UUID assignerId = facture.getAssigner() != null ? facture.getAssigner().getId() : null;
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
                assignerId
                
        );
    }
}

