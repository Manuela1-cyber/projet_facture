package com.example.demo.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.controller.payload.AssignerCreateRequest;
import com.example.demo.controller.payload.AssignerExitRequest;
import com.example.demo.controller.payload.AssignerResponse;
import com.example.demo.model.Appartement;
import com.example.demo.model.Assigner;
import com.example.demo.model.Locataires;
import com.example.demo.model.enems.StatutAssigner;
import com.example.demo.repository.AppartementRepository;
import com.example.demo.repository.AssignerRepository;
import com.example.demo.repository.LocatairesRepository;

@Service
public class AssignerServiceImpl implements AssignerService {

    private final AssignerRepository assignerRepository;
    private final LocatairesRepository locatairesRepository;
    private final AppartementRepository appartementRepository;

    public AssignerServiceImpl(AssignerRepository assignerRepository, LocatairesRepository locatairesRepository, AppartementRepository appartementRepository) {
        this.assignerRepository = assignerRepository;
        this.locatairesRepository = locatairesRepository;
        this.appartementRepository = appartementRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignerResponse> list() {
        return assignerRepository.findAll().stream()
                .map(AssignerServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AssignerResponse get(UUID id) {
        return assignerRepository.findById(id)
                .map(AssignerServiceImpl::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigner introuvable"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignerResponse> getByLocataireId(UUID locataireId) {
        return assignerRepository.findByLocataire_Id(locataireId).stream()
                .map(AssignerServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignerResponse> getByAppartementId(UUID appartementId) {
        return assignerRepository.findByAppartement_Id(appartementId).stream()
                .map(AssignerServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AssignerResponse create(AssignerCreateRequest request) {
        Locataires locataire = locatairesRepository.findById(request.locataireId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Locataire introuvable"));

        Appartement appartement = appartementRepository.findById(request.appartementId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appartement introuvable"));

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime farFuture = now.plusYears(100);

        Assigner assigner = Assigner.builder()
                .locataire(locataire)
                .appartement(appartement)
                .enterAt(now)
                .exitAt(farFuture)
                .build();

        return toResponse(assignerRepository.save(assigner));
    }

    @Override
    @Transactional
    public AssignerResponse exit(UUID id, AssignerExitRequest request) {
        Assigner assigner = assignerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigner introuvable"));

        assigner.setExitAt(request.exitAt());
        assigner.setStatut(StatutAssigner.EXIT);

        return toResponse(assignerRepository.save(assigner));
    }

    private static AssignerResponse toResponse(Assigner assigner) {
        UUID locataireId = assigner.getLocataire() != null ? assigner.getLocataire().getId() : null;
        UUID appartementId = assigner.getAppartement() != null ? assigner.getAppartement().getId() : null;
        return new AssignerResponse(
                assigner.getId(),
                locataireId,
                appartementId,
                assigner.getStatut(),
                assigner.getEnterAt(),
                assigner.getExitAt()
        );
    }
}
