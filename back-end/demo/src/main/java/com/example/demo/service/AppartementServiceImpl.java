// package com.example.demo.service;

// public class AppartementServiceImpl {
    
// }
package com.example.demo.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.controller.payload.AppartementCreateRequest;
import com.example.demo.controller.payload.AppartementResponse;
import com.example.demo.controller.payload.AppartementUpdateRequest;
import com.example.demo.model.Appartement;
import com.example.demo.model.Proprietes;
import com.example.demo.repository.ProprietesRepository;
import com.example.demo.repository.AppartementRepository;



@Service
public class AppartementServiceImpl implements AppartementService {

    private final AppartementRepository appartementRepository;
    private final ProprietesRepository proprietesRepository;

    public AppartementServiceImpl(
            AppartementRepository appartementRepository,
            ProprietesRepository proprietesRepository
    ) {
        this.appartementRepository = appartementRepository;
        this.proprietesRepository = proprietesRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppartementResponse> list() {
        return appartementRepository.findAll().stream().map(AppartementServiceImpl::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppartementResponse get(UUID id) {
        return appartementRepository.findById(id).map(AppartementServiceImpl::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "appartement introuvable"));
    }

    @Override
    @Transactional
    public AppartementResponse create(AppartementCreateRequest request) {
        Proprietes propriete = proprietesRepository.findById(request.proprieteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "proprieteId invalide"));

        Appartement appartement = Appartement.builder()
                .nom(request.nom())
                .propriete(propriete)
                .build();

        return toResponse(appartementRepository.save(appartement));
    }

    @Override
    @Transactional
    public AppartementResponse update(UUID id, AppartementUpdateRequest request) {
        Appartement appartement = appartementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appartement introuvable"));

        Proprietes propriete = proprietesRepository.findById(request.proprieteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "proprieteId invalide"));

        appartement.setNom(request.nom());
        appartement.setPropriete(propriete);

        return toResponse(appartementRepository.save(appartement));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Appartement appartement = appartementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appartement introuvable"));

        if (appartement.getLocataire() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Impossible de supprimer un appartement ayant un locataire"
            );
        }

       

        appartementRepository.deleteById(id);
    }

    private static AppartementResponse toResponse(Appartement appartement) {
        UUID locataireId = appartement.getLocataire() != null ? appartement.getLocataire().getId() : null;
        UUID proprieteId = appartement.getPropriete() != null ? appartement.getPropriete().getId() : null;
        return new AppartementResponse(
                appartement.getId(),
                appartement.getNom(),
                locataireId,
                proprieteId
        );
    }
}
