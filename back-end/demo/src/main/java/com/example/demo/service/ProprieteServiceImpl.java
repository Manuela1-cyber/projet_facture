package com.example.demo.service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.controller.payload.ProprieteCreateRequest;
import com.example.demo.controller.payload.ProprieteResponse;
import com.example.demo.controller.payload.ProprieteUpdateRequest;
import com.example.demo.model.Appartement;
import com.example.demo.model.Proprietes;
import com.example.demo.repository.AppartementRepository;
import com.example.demo.repository.AssignerRepository;
import com.example.demo.repository.ProprietesRepository;

@Service
public class ProprieteServiceImpl implements ProprieteService {

    private final ProprietesRepository proprietesRepository;
    private final AppartementRepository appartementRepository;
    private final AssignerRepository assignerRepository;

    public ProprieteServiceImpl(
            ProprietesRepository proprietesRepository,
            AppartementRepository appartementRepository,
            AssignerRepository assignerRepository
    ) {
        this.proprietesRepository = proprietesRepository;
        this.appartementRepository = appartementRepository;
        this.assignerRepository = assignerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProprieteResponse> list() {
        return proprietesRepository.findAll().stream()
                .map(ProprieteServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProprieteResponse get(UUID id) {
        return proprietesRepository.findById(id)
                .map(ProprieteServiceImpl::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Propriete introuvable"));
    }

    @Override
    @Transactional
    public ProprieteResponse create(ProprieteCreateRequest request) {
        Proprietes propriete = Proprietes.builder()
                .residence(request.residence())
                .unites(request.unites())
                .build();

        Proprietes savedPropriete = proprietesRepository.save(propriete);

        for (int i = 1; i <= request.unites(); i++) {
            appartementRepository.save(Appartement.builder()
                    .nom(defaultAppartementName(i))
                    .propriete(savedPropriete)
                    .build());
        }

        return toResponse(savedPropriete);
    }

    @Override
    @Transactional
    public ProprieteResponse update(UUID id, ProprieteUpdateRequest request) {
        Proprietes propriete = proprietesRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Propriete introuvable"));

        List<Appartement> appartements = appartementRepository.findByPropriete_Id(id);
        int currentCount = appartements.size();
        List<UUID> appartementIdsToDelete = request.appartementIdsToDelete() == null
                ? Collections.emptyList()
                : request.appartementIdsToDelete();

        if (request.unites() < currentCount) {
            int expectedDeletes = currentCount - request.unites();
            if (appartementIdsToDelete.size() != expectedDeletes) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Veuillez selectionner exactement " + expectedDeletes + " appartement(s) a supprimer"
                );
            }

            for (UUID appartementId : appartementIdsToDelete) {
                Appartement appartement = appartements.stream()
                        .filter(item -> item.getId().equals(appartementId))
                        .findFirst()
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Un appartement selectionne n'appartient pas a cette propriete"
                        ));

                if (appartement.getLocataire() != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Impossible de supprimer l'appartement " + appartement.getNom() + " car il a un locataire"
                    );
                }

                if (assignerRepository.existsByAppartement_Id(appartementId)) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Impossible de supprimer l'appartement " + appartement.getNom() + " car il a des assignations"
                    );
                }
            }

            appartementRepository.deleteAllById(appartementIdsToDelete);
        } else if (!appartementIdsToDelete.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucune suppression d'appartement n'est attendue pour cette modification"
            );
        }

        propriete.setResidence(request.residence());
        propriete.setUnites(request.unites());
        Proprietes savedPropriete = proprietesRepository.save(propriete);

        int remainingCount = appartementRepository.findByPropriete_Id(id).size();
        if (request.unites() > remainingCount) {
            for (int i = remainingCount + 1; i <= request.unites(); i++) {
                appartementRepository.save(Appartement.builder()
                        .nom(defaultAppartementName(i))
                        .propriete(savedPropriete)
                        .build());
            }
        }

        return toResponse(savedPropriete);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!proprietesRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Propriete introuvable");
        }
        proprietesRepository.deleteById(id);
    }

    private static ProprieteResponse toResponse(Proprietes propriete) {
        return new ProprieteResponse(
                propriete.getId(),
                propriete.getResidence(),
                propriete.getUnites()
        );
    }

    private static String defaultAppartementName(int index) {
        return "Apt A" + index;
    }
}
