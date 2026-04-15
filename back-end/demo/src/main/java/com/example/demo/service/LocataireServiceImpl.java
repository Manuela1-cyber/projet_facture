package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.controller.payload.LocataireCreateRequest;
import com.example.demo.controller.payload.LocataireResponse;
import com.example.demo.controller.payload.LocataireUpdateRequest;
import com.example.demo.model.Locataires;
import com.example.demo.model.Proprietes;
import com.example.demo.repository.LocatairesRepository;
import com.example.demo.repository.ProprietesRepository;

@Service
public class LocataireServiceImpl implements LocataireService {

    private final LocatairesRepository locatairesRepository;
    private final ProprietesRepository proprietesRepository;

    public LocataireServiceImpl(
            LocatairesRepository locatairesRepository,
            ProprietesRepository proprietesRepository
    ) {
        this.locatairesRepository = locatairesRepository;
        this.proprietesRepository = proprietesRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocataireResponse> list() {
        return locatairesRepository.findAll().stream().map(LocataireServiceImpl::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LocataireResponse get(UUID id) {
        return locatairesRepository.findById(id).map(LocataireServiceImpl::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Locataire introuvable"));
    }

    @Override
    @Transactional
    public LocataireResponse create(LocataireCreateRequest request) {
        Proprietes propriete = proprietesRepository.findById(request.proprieteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "proprieteId invalide"));

        Locataires locataire = Locataires.builder()
                .name(request.name())
                .phone(request.phone())
                .email(request.email())
                .propriete(propriete)
                .build();

        return toResponse(locatairesRepository.save(locataire));
    }

    @Override
    @Transactional
    public LocataireResponse update(UUID id, LocataireUpdateRequest request) {
        Locataires locataire = locatairesRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Locataire introuvable"));

        Proprietes propriete = proprietesRepository.findById(request.proprieteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "proprieteId invalide"));

        locataire.setName(request.name());
        locataire.setPhone(request.phone());
        locataire.setEmail(request.email());
        locataire.setPropriete(propriete);

        return toResponse(locatairesRepository.save(locataire));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!locatairesRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Locataire introuvable");
        }
        locatairesRepository.deleteById(id);
    }

    private static LocataireResponse toResponse(Locataires locataire) {
        UUID proprieteId = locataire.getPropriete() != null ? locataire.getPropriete().getId() : null;
        return new LocataireResponse(
                locataire.getId(),
                locataire.getName(),
                locataire.getPhone(),
                locataire.getEmail(),
                proprieteId
        );
    }
}