"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Home, LogOut, ChevronRight, X } from "lucide-react";
import { Appartement, Assigner, Facture, Propriete, createPropriete, deletePropriete, getAppartements, getAssignations, getFactures, getProprietes, updateAppartement, updatePropriete, exitAssigner } from "../../lib/api/facture";

function isPositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export default function Proprietes() {
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [assignations, setAssignations] = useState<Assigner[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProprieteId, setSelectedProprieteId] = useState<string | null>(null);

  const [unites, setUnites] = useState<string>("");
  const [residence, setResidence] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [selectedAppartementIdsToDelete, setSelectedAppartementIdsToDelete] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const isAppartementOccupied = (appartementId: string): boolean => {
    return assignations.some((a) => a.appartementId === appartementId && a.statut?.toUpperCase() === "ENTER");
  };


  const getActiveAssigner = (appartementId: string): Assigner | undefined => {
    return assignations.find((a) => a.appartementId === appartementId && a.statut?.toUpperCase() === "ENTER");
  };

  const appartementsByPropriete = useMemo(() => {
    return appartements.reduce<Record<string, Appartement[]>>((acc, appartement) => {
      const key = appartement.proprieteId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(appartement);
      return acc;
    }, {});
  }, [appartements]);

  const factureCountByAppartement = useMemo(() => {
    const assignerById = new Map(assignations.map((a) => [a.id, a]));
    const count: Record<string, number> = {};

    factures.forEach((facture) => {
      const assigner = assignerById.get(facture.assignerId);
      if (assigner?.appartementId) {
        count[assigner.appartementId] = (count[assigner.appartementId] ?? 0) + 1;
      }
    });

    return count;
  }, [factures, assignations]);

  const appartementsForEditing = useMemo(() => {
    if (!selectedProprieteId) return [];
    return appartementsByPropriete[selectedProprieteId] ?? [];
  }, [appartementsByPropriete, selectedProprieteId]);

  const targetUnites = Number(unites);
  const unitsToRemove =
    selectedProprieteId && Number.isInteger(targetUnites) && targetUnites < appartementsForEditing.length
      ? appartementsForEditing.length - targetUnites
      : 0;

  const filteredProprietes = useMemo(() => {
    return proprietes.filter((propriete) => {
      const appartementsOfPropriete = appartementsByPropriete[propriete.id] ?? [];
      const searchableAppartementNames = appartementsOfPropriete.map((item) => item.nom.toLowerCase());
      const normalizedFilter = filterText.toLowerCase();

      return (
        propriete.residence.toLowerCase().includes(normalizedFilter) ||
        String(propriete.unites).includes(normalizedFilter) ||
        searchableAppartementNames.some((name) => name.includes(normalizedFilter))
      );
    });
  }, [appartementsByPropriete, filterText, proprietes]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [proprietesRes, appartementsRes, facturesRes, assignationsRes] = await Promise.all([
        getProprietes(),
        getAppartements(),
        getFactures(),
        getAssignations(),
      ]);

      setProprietes(proprietesRes);
      setAppartements(appartementsRes);
      setFactures(facturesRes);
      setAssignations(assignationsRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const clearForm = () => {
    setSelectedProprieteId(null);
    setUnites("");
    setResidence("");
    setSelectedAppartementIdsToDelete([]);
  };

  const openFormForCreate = () => {
    clearForm();
    setShowCreateForm(true);
  };

  const openFormForEdit = (propriete: Propriete) => {
    setSelectedProprieteId(propriete.id);
    setUnites(String(propriete.unites));
    setResidence(propriete.residence);
    setSelectedAppartementIdsToDelete([]);
  };

  const closeEditPanel = () => {
    setSelectedProprieteId(null);
    setShowCreateForm(false);
    clearForm();
  };

  const appartementHasDependencies = (appartement: Appartement) => {
    const hasActiveAssigner = getActiveAssigner(appartement.id) !== undefined;
    return hasActiveAssigner || (factureCountByAppartement[appartement.id] ?? 0) > 0;
  };

  const toggleAppartementToDelete = (appartement: Appartement) => {
    if (appartementHasDependencies(appartement)) return;

    setSelectedAppartementIdsToDelete((current) => {
      if (current.includes(appartement.id)) {
        return current.filter((id) => id !== appartement.id);
      }
      return [...current, appartement.id];
    });
  };

  const handleSave = async () => {
    if (!residence || !unites) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!isPositiveInteger(unites)) {
      setError("Le nombre d'unites doit etre un entier positif.");
      return;
    }

    const parsedUnites = Number(unites);

    if (selectedProprieteId && parsedUnites < appartementsForEditing.length) {
      if (selectedAppartementIdsToDelete.length !== unitsToRemove) {
        setError(`Selectionnez exactement ${unitsToRemove} appartement(s) a supprimer.`);
        return;
      }

      const invalidSelection = appartementsForEditing.some(
        (appartement) =>
          selectedAppartementIdsToDelete.includes(appartement.id) &&
          appartementHasDependencies(appartement)
      );

      if (invalidSelection) {
        setError("Certains appartements selectionnes ne peuvent pas etre supprimes.");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      if (selectedProprieteId) {
        await updatePropriete(selectedProprieteId, {
          residence,
          unites: parsedUnites,
          appartementIdsToDelete: parsedUnites < appartementsForEditing.length
            ? selectedAppartementIdsToDelete
            : [],
        });
      } else {
        await createPropriete({
          residence,
          unites: parsedUnites,
        });
      }
      await loadAll();
      closeEditPanel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setLoading(true);
    try {
      await deletePropriete(id);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (propriete: Propriete) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la propriete ${propriete.residence} ?`
    );
    if (!confirmed) return;
    await handleDelete(propriete.id);
  };

  const handleRenameAppartement = async (appartement: Appartement) => {
    const newName = window.prompt("Nouveau nom de l'appartement", appartement.nom);
    if (!newName) return;
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === appartement.nom) return;

    setError(null);
    try {
      await updateAppartement(appartement.id, {
        nom: trimmedName,
        locataireId: appartement.locataireId,
        proprieteId: appartement.proprieteId,
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    }
  };

  const handleLiberateAppartement = async (appartement: Appartement) => {
    const assigner = getActiveAssigner(appartement.id);
    if (!assigner) {
      setError("Aucune assignation trouvée pour cet appartement");
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment libérer l'appartement ${appartement.nom} ?`
    );
    if (!confirmed) return;

    setError(null);
    try {
      const now = new Date().toISOString();
      await exitAssigner(assigner.id, now);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="p-8 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proprietes</h1>
            <p className="text-gray-500 mt-1">Gerez vos proprietes et leurs appartements</p>
          </div>

          <button
            onClick={openFormForCreate}
            className="bg-purple-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-800"
          >
            <Plus className="w-5 h-5" />
            Nouvelle propriete
          </button>
        </div>
      </div>


      <div className="p-8">
        <div className="max-w-7xl mx-auto">

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une residence..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProprietes.map((propriete) => {
              const appartementsOfPropriete = appartementsByPropriete[propriete.id] ?? [];
              const occupiedCount = appartementsOfPropriete.filter((a) => isAppartementOccupied(a.id)).length;

              return (
                <div
                  key={propriete.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer overflow-hidden group"
                >

                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white">
                        <Home className="text-purple-600 w-6 h-6" />
                      </div>
                      <button
                        onClick={() => confirmDelete(propriete)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{propriete.residence}</h3>
                  </div>


                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Appartements</span>
                        <span className="font-semibold text-gray-900">{appartementsOfPropriete.length}/{propriete.unites}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Occupés</span>
                        <span className="font-semibold text-gray-900">{occupiedCount}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all"
                          style={{ width: `${appartementsOfPropriete.length > 0 ? (occupiedCount / appartementsOfPropriete.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>


                    <button
                      onClick={() => openFormForEdit(propriete)}
                      className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium rounded-lg flex items-center justify-center gap-2 transition-all group"
                    >
                      Détails
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProprietes.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Aucune propriété trouvée</p>
            </div>
          )}
        </div>
      </div>


      {(showCreateForm || selectedProprieteId) && (
        <div
          className="fixed inset-0 bg-white bg-opacity-60 z-40 flex items-center justify-center"
          onClick={closeEditPanel}
        />
      )}


      {(showCreateForm || selectedProprieteId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedProprieteId ? `${proprietes.find((p) => p.id === selectedProprieteId)?.residence}` : "Nouvelle propriete"}
                </h2>
                <button
                  onClick={closeEditPanel}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {error}
                </div>
              )}

              {/* <div className="space-y-4 mb-6 gap-2"> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Residence *</span>
                  <input
                    type="text"
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nom de la residence"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Nombre d'appartements *</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={unites}
                    onChange={(e) => setUnites(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nombre d'appartements"
                  />
                </label>
              </div>


              {selectedProprieteId && (
                <div className="mb-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Appartements ({appartementsForEditing.length})
                  </h3>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {appartementsForEditing.map((appartement) => {
                      const occupied = isAppartementOccupied(appartement.id);
                      const factureCount = factureCountByAppartement[appartement.id] ?? 0;
                      const isProtected = appartementHasDependencies(appartement);
                      const isSelected = selectedAppartementIdsToDelete.includes(appartement.id);

                      return (
                        <div
                          key={appartement.id}
                          className={`p-4 rounded-xl border ${isSelected ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"
                            } ${isProtected && unitsToRemove > 0 ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            {unitsToRemove > 0 && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isProtected || !unitsToRemove}
                                onChange={() => toggleAppartementToDelete(appartement)}
                                className="cursor-pointer"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{appartement.nom}</p>
                              <p className="text-xs text-gray-500">
                                {occupied ? "Occupé" : "Libre"}
                                {factureCount > 0 ? ` · ${factureCount} facture(s)` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRenameAppartement(appartement)}
                            // className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-gray-700 hover:bg-slate-50"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {occupied && (
                              <button
                                type="button"
                                onClick={() => handleLiberateAppartement(appartement)}
                              // className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-gray-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {/* <button
                              type="button"
                              onClick={() => handleRenameAppartement(appartement)}
                              // className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-gray-700 hover:bg-slate-50"
                            >
                              <Edit className="w-4 h-4" />
                            </button> */}
                            {/* {occupied && (
                              <button
                                type="button"
                                onClick={() => handleLiberateAppartement(appartement)}
                                // className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-gray-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            )} */}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {unitsToRemove > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Selectionnez {unitsToRemove} appartement(s) à supprimer.
                    </div>
                  )}

                  {selectedProprieteId && targetUnites > appartementsForEditing.length && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      {targetUnites - appartementsForEditing.length} appartement(s) supplementaire(s) sera/seront cree(s).
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-purple-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>

                <button
                  onClick={closeEditPanel}
                  className="flex-1 border border-slate-200 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
