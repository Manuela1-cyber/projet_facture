"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Download, FileText, Edit, BellRing, Check, AlertTriangle, X, Send, Clock, CalendarDays } from "lucide-react";
import { Facture, Assigner, getFactures, createFacture, updateFacture, deleteFacture, getLocataires, getAppartements, getProprietes, getAssignations, Locataire, Appartement, Propriete, buildLocatairePortalPath, sendFactureByEmail } from "../../lib/api/facture";
import Home from "../page";

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function formatAmount(amount?: number) {
  if (amount == null) return "";
  return `${amount.toLocaleString()} F`;
}

function getMonthKey(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return "";
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function getMonthsRangeFromFactures(factures: Facture[]) {
  const dates = factures
    .map((f) => new Date(f.issuedAt))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (dates.length === 0) return [];

  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const months: string[] = [];
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

type FactureUI = Facture & {
  locataireName?: string;
  appartementName?: string;
  residence?: string;
};

type VariableLine = {
  assignerId: string;
  ancienIndex: string;
  nouveauIndex: string;
  prixM3: string;
};

type AssignerOption = {
  id: string;
  locataireId: string;
  locataireName: string;
  appartementId: string;
  appartementNom: string;
  proprieteId: string;
  residence: string;
};

function calculateVariableAmount(
  ancienIndex: string | number,
  nouveauIndex: string | number,
  prixM3: string | number
) {
  const ancien = Number(ancienIndex) || 0;
  const nouveau = Number(nouveauIndex) || 0;
  const prix = Number(prixM3) || 0;
  return Math.max(nouveau - ancien, 0) * prix;
}

export default function Factures() {
  const searchParams = useSearchParams();
  const urlProprieteId = searchParams.get("proprieteId") || "";
  const urlStatut = searchParams.get("statut");
  const urlType = searchParams.get("type");
  const urlMonth = searchParams.get("mois") || "";
  const normalizedUrlStatut =
    urlStatut === "PAYE" || urlStatut === "EN_ATTENTE" || urlStatut === "EN_RETARD"
      ? urlStatut
      : null;
  const normalizedUrlType =
    urlType === "FIXE" || urlType === "VARIABLE"
      ? urlType
      : null;

  const [factures, setFactures] = useState<Facture[]>([]);
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [assignations, setAssignations] = useState<Assigner[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [issuedAt, setIssuedAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [duetAt, setDuetAt] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [amount, setAmount] = useState<number | "">(0);
  const [type, setType] = useState<Facture["type"]>("FIXE");
  const [statut, setStatut] = useState<Facture["statut"]>("EN_ATTENTE");
  const [assignerId, setAssignerId] = useState<string>("");
  const [proprieteId, setProprieteId] = useState<string>(urlProprieteId);
  const [filterStatut, setFilterStatut] = useState<Facture["statut"] | null>(normalizedUrlStatut);
  const [filterType, setFilterType] = useState<Facture["type"] | null>(normalizedUrlType);
  const [filterText, setFilterText] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>(urlMonth);
  const [ancienIndex, setAncienIndex] = useState<string>("");
  const [nouveauIndex, setNouveauIndex] = useState<string>("");
  const [prixM3, setPrixM3] = useState<string>("");
  const [globalPrixM3, setGlobalPrixM3] = useState<string>("");
  const [variableLines, setVariableLines] = useState<VariableLine[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const assignerOptions = useMemo<AssignerOption[]>(() => {
    const locById = new Map(locataires.map((l) => [l.id, l]));
    const aptById = new Map(appartements.map((a) => [a.id, a]));
    const propById = new Map(proprietes.map((p) => [p.id, p]));

    return assignations.map((assigner) => {
      const locataire = locById.get(assigner.locataireId);
      const appartement = aptById.get(assigner.appartementId);
      const propriete = propById.get(appartement?.proprieteId ?? "");

      return {
        id: assigner.id,
        locataireId: assigner.locataireId,
        locataireName: locataire?.name ?? "Locataire inconnu",
        appartementId: assigner.appartementId,
        appartementNom: appartement?.nom ?? "Appartement inconnu",
        proprieteId: appartement?.proprieteId ?? "",
        residence: propriete?.residence ?? "Résidence inconnue",
      };
    });
  }, [assignations, locataires, appartements, proprietes]);

  const variableLinesWithDetails = useMemo(() => {
    const assignerById = new Map(assignerOptions.map((assigner) => [assigner.id, assigner]));

    return variableLines.map((line) => {
      const assigner = assignerById.get(line.assignerId);
      return {
        ...line,
        locataireName: assigner?.locataireName ?? "Locataire inconnu",
        appartementName: assigner?.appartementNom ?? "Appartement inconnu",
        residence: assigner?.residence ?? "Résidence inconnue",
        total: calculateVariableAmount(line.ancienIndex, line.nouveauIndex, line.prixM3),
      };
    });
  }, [assignerOptions, variableLines]);

  const variableTableAssigners = useMemo(
    () => {
      const filtered = assignerOptions.filter((assigner) => {
        if (proprieteId && assigner.proprieteId !== proprieteId) return false;
        // Only show assigners that have at least one VARIABLE facture
        const hasVariableFacture = factures.some(
          (f) => f.assignerId === assigner.id && f.type === "VARIABLE"
        );
        return hasVariableFacture;
      });
      return filtered;
    },
    [assignerOptions, proprieteId, factures]
  );

  const variableLineByAssignerId = useMemo(
    () => new Map(variableLinesWithDetails.map((line) => [line.assignerId, line])),
    [variableLinesWithDetails]
  );

  const filteredFactures = useMemo<Facture[]>(() => {
    const assignerById = new Map(assignerOptions.map((a) => [a.id, a]));
    const propById = new Map(proprietes.map((p) => [p.id, p]));

    let list = factures;
    if (filterStatut) {
      list = list.filter((f) => f.statut === filterStatut);
    }
    if (filterType) {
      list = list.filter((f) => f.type === filterType);
    }
    if (proprieteId) {
      list = list.filter((f) => {
        const assigner = assignerById.get(f.assignerId);
        return assigner?.proprieteId === proprieteId;
      });
    }
    if (filterText) {
      list = list.filter((f) => {
        const assigner = assignerById.get(f.assignerId);
        const prop = propById.get(assigner?.proprieteId ?? "");

        return (
          f.id.toLowerCase().includes(filterText) ||
          (assigner && assigner.locataireName.toLowerCase().includes(filterText)) ||
          (assigner && assigner.appartementNom.toLowerCase().includes(filterText)) ||
          (prop && prop.residence.toLowerCase().includes(filterText))
        );
      });
    }

    return list;
  }, [factures, assignerOptions, proprietes, filterStatut, filterType, proprieteId, filterText]);

  const monthCards = useMemo(() => {
    const byMonth = new Map<string, { count: number; total: number }>();
    for (const facture of filteredFactures) {
      const monthKey = getMonthKey(facture.issuedAt);
      if (!monthKey) continue;
      const prev = byMonth.get(monthKey) ?? { count: 0, total: 0 };
      byMonth.set(monthKey, {
        count: prev.count + 1,
        total: prev.total + (facture.amount ?? 0),
      });
    }

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, stats]) => ({
        monthKey,
        label: getMonthLabel(monthKey),
        ...stats,
      }));
  }, [filteredFactures]);

  const invoicesWithNames = useMemo<FactureUI[]>(() => {
    const assignerById = new Map(assignerOptions.map((a) => [a.id, a]));
    const propById = new Map(proprietes.map((p) => [p.id, p]));
    const byMonth = filterMonth
      ? filteredFactures.filter((f) => getMonthKey(f.issuedAt) === filterMonth)
      : filteredFactures;

    return byMonth
      .slice()
      .sort(
        (a, b) =>
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      )
      .map((f) => {
      const assigner = assignerById.get(f.assignerId);
      const prop = propById.get(assigner?.proprieteId ?? "");

      return {
        ...f,
        locataireName: assigner?.locataireName,
        appartementName: assigner?.appartementNom,
        residence: prop?.residence,
      };
    });
  }, [filteredFactures, assignerOptions, proprietes, filterMonth]);

  const totalPages = Math.max(1, Math.ceil(invoicesWithNames.length / itemsPerPage));
  const paginatedInvoices = useMemo(
    () =>
      invoicesWithNames.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [invoicesWithNames, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterStatut, filterType, filterText, proprieteId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks = [
        { key: "factures", promise: getFactures() },
        { key: "locataires", promise: getLocataires() },
        { key: "appartements", promise: getAppartements() },
        { key: "proprietes", promise: getProprietes() },
        { key: "assignations", promise: getAssignations() },
      ] as const;

      const results = await Promise.allSettled(tasks.map((t) => t.promise));

      const facturesRes =
        results[0].status === "fulfilled" ? (results[0].value as Facture[]) : [];
      const locatairesRes =
        results[1].status === "fulfilled" ? (results[1].value as Locataire[]) : [];
      const appartementsRes =
        results[2].status === "fulfilled"
          ? (results[2].value as Appartement[])
          : [];
      const proprietesRes =
        results[3].status === "fulfilled" ? (results[3].value as Propriete[]) : [];
      const assignationsRes =
        results[4].status === "fulfilled" ? (results[4].value as Assigner[]) : [];

      const failed = results.find((r) => r.status === "rejected");
      if (failed) {
        const failedIndex = results.findIndex((r) => r.status === "rejected");
        const failedKey = tasks[failedIndex]?.key ?? "inconnu";
        const msg =
          failed.reason instanceof Error ? failed.reason.message : String(failed.reason);
        setError(`Erreur chargement API (${failedKey}): ${msg}`);
      }

      setFactures(facturesRes);
      setLocataires(locatairesRes);
      setAppartements(appartementsRes);
      setProprietes(proprietesRes);
      setAssignations(assignationsRes);

      if (!assignerId && assignationsRes.length > 0) {
        setAssignerId(assignationsRes[0].id);
      }
      if (!proprieteId && proprietesRes.length > 0) {
        setProprieteId(proprietesRes[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    if (urlProprieteId) {
      setProprieteId(urlProprieteId);
    }
  }, [urlProprieteId]);

  useEffect(() => {
    setFilterStatut(normalizedUrlStatut);
  }, [normalizedUrlStatut]);

  useEffect(() => {
    setFilterType(normalizedUrlType);
  }, [normalizedUrlType]);

  useEffect(() => {
    setFilterMonth(urlMonth);
  }, [urlMonth]);

  const clearForm = () => {
    setEditingId(null);
    setIssuedAt(new Date().toISOString().slice(0, 10));
    setDuetAt(() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 10);
    });
    setAmount(0);
    setType("FIXE");
    setStatut("EN_ATTENTE");
    setAssignerId(assignerOptions[0]?.id ?? "");
    setProprieteId(urlProprieteId || proprietes[0]?.id || "");
    setAncienIndex("");
    setNouveauIndex("");
    setPrixM3("");
    setGlobalPrixM3("");
    setVariableLines([]);
  };

  const openFormForCreate = () => {
    clearForm();
    setShowForm(true);
  };

  const openFormForEdit = (invoice: FactureUI) => {
    setEditingId(invoice.id);
    setIssuedAt(invoice.issuedAt);
    setDuetAt(invoice.duetAt);
    setAmount(invoice.amount);
    setType(invoice.type);
    setStatut(invoice.statut);
    setAssignerId(invoice.assignerId);
    const assigner = assignerOptions.find((a) => a.id === invoice.assignerId);
    setProprieteId(assigner?.proprieteId ?? "");
    setAncienIndex(invoice.ancienIndex?.toString() ?? "");
    setNouveauIndex(invoice.nouveauIndex?.toString() ?? "");
    setPrixM3(invoice.prixM3?.toString() ?? "");
    setGlobalPrixM3(invoice.prixM3?.toString() ?? "");
    setVariableLines(
      invoice.type === "VARIABLE"
        ? [
          {
            assignerId: invoice.assignerId,
            ancienIndex: invoice.ancienIndex?.toString() ?? "",
            nouveauIndex: invoice.nouveauIndex?.toString() ?? "",
            prixM3: invoice.prixM3?.toString() ?? "",
          },
        ]
        : []
    );
    setShowForm(true);
  };

  const calculMontantVariable = () => {
    if (!ancienIndex || !nouveauIndex || !prixM3) return "";
    return formatAmount(calculateVariableAmount(ancienIndex, nouveauIndex, prixM3));
  };

  const statutBadge = (statut: Facture["statut"]) => {
    switch (statut) {
      case "PAYE":
        return "bg-emerald-50 text-emerald-700";
      case "EN_RETARD":
        return "bg-red-50 text-red-600";
      case "EN_ATTENTE":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const addVariableLine = (assigner: AssignerOption) => {
    setVariableLines((current) => [
      ...current,
      {
        assignerId: assigner.id,
        ancienIndex: "",
        nouveauIndex: "",
        prixM3: globalPrixM3,
      },
    ]);
  };

  const updateVariableLine = (
    assignerIdToUpdate: string,
    field: keyof Omit<VariableLine, "assignerId">,
    value: string
  ) => {
    setVariableLines((current) => {
      const existingLine = current.find((line) => line.assignerId === assignerIdToUpdate);

      if (!existingLine) {
        return [
          ...current,
          {
            assignerId: assignerIdToUpdate,
            ancienIndex: field === "ancienIndex" ? value : "",
            nouveauIndex: field === "nouveauIndex" ? value : "",
            prixM3: field === "prixM3" ? value : globalPrixM3,
          },
        ];
      }

      return current.map((line) =>
        line.assignerId === assignerIdToUpdate ? { ...line, [field]: value } : line
      );
    });
  };

  const removeVariableLine = (assignerIdToRemove: string) => {
    setVariableLines((current) =>
      current.filter((line) => line.assignerId !== assignerIdToRemove)
    );
  };

  const handleSaveVariableLine = async (line: VariableLine) => {
    if (!line.assignerId) {
      setError("Assignation manquante pour cette ligne.");
      return;
    }

    if (!line.nouveauIndex || !line.prixM3) {
      setError("Renseignez au minimum le nouveau index et le prix m³ avant de valider.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createFacture({
        issuedAt,
        duetAt,
        amount: calculateVariableAmount(line.ancienIndex, line.nouveauIndex, line.prixM3),
        type: "VARIABLE",
        statut,
        assignerId: line.assignerId,
        ancienIndex: line.ancienIndex ? Number(line.ancienIndex) : undefined,
        nouveauIndex: line.nouveauIndex ? Number(line.nouveauIndex) : undefined,
        prixM3: line.prixM3 ? Number(line.prixM3) : undefined,
      });

      removeVariableLine(line.assignerId);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  };

  const applyGlobalPrice = () => {
    if (!globalPrixM3) return;
    setVariableLines((current) =>
      current.map((line) => ({ ...line, prixM3: globalPrixM3 }))
    );
  };

  const handleSave = async () => {
    if (type === "VARIABLE" && !editingId) {
      if (variableLines.length === 0) {
        setError("Ajoutez au moins une assignation dans le tableau des factures variables.");
        return;
      }

      const incompleteLine = variableLines.find(
        (line) => !line.assignerId || !line.nouveauIndex || !line.prixM3
      );

      if (incompleteLine) {
        setError("Renseignez au minimum le nouveau index et le prix m³ pour chaque ligne.");
        return;
      }

      setSaving(true);
      setError(null);

      try {
        await Promise.all(
          variableLines.map((line) =>
            createFacture({
              issuedAt,
              duetAt,
              amount: calculateVariableAmount(
                line.ancienIndex,
                line.nouveauIndex,
                line.prixM3
              ),
              type: "VARIABLE",
              statut,
              assignerId: line.assignerId,
              ancienIndex: line.ancienIndex ? Number(line.ancienIndex) : undefined,
              nouveauIndex: line.nouveauIndex ? Number(line.nouveauIndex) : undefined,
              prixM3: line.prixM3 ? Number(line.prixM3) : undefined,
            })
          )
        );
        await loadAll();
        setShowForm(false);
        clearForm();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inattendue");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!assignerId) {
      setError("Veuillez sélectionner une assignation.");
      return;
    }

    let calculatedAmount = Number(amount) || 0;
    if (type === "VARIABLE") {
      calculatedAmount = calculateVariableAmount(ancienIndex, nouveauIndex, prixM3);
    }

    const payload: Omit<Facture, "id"> = {
      issuedAt,
      duetAt,
      amount: calculatedAmount,
      type,
      statut,
      assignerId,
      ...(type === "VARIABLE"
        ? {
          ancienIndex: ancienIndex ? Number(ancienIndex) : undefined,
          nouveauIndex: nouveauIndex ? Number(nouveauIndex) : undefined,
          prixM3: prixM3 ? Number(prixM3) : undefined,
        }
        : {}),
    };
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateFacture(editingId, payload);
      } else {
        await createFacture(payload);
      }
      await loadAll();
      setShowForm(false);
      clearForm();
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
      await deleteFacture(id);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (invoice: FactureUI) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la facture de ${invoice.locataireName ?? 'locataire inconnu'} (${formatAmount(invoice.amount)}) ?`
    );
    if (!confirmed) return;
    await handleDelete(invoice.id);
  };

  const handleMarkPaid = async (invoice: FactureUI) => {
    const nextStatut: Facture["statut"] =
      invoice.statut === "PAYE" ? "EN_ATTENTE" : "PAYE";
    const confirmed = window.confirm(
      nextStatut === "PAYE"
        ? `Marquer la facture de ${invoice.locataireName ?? "locataire inconnu"} comme payée ?`
        : `Annuler le paiement de la facture de ${invoice.locataireName ?? "locataire inconnu"} et la remettre en attente ?`
    );
    if (!confirmed) return;

    const { id, ...rest } = invoice;
    await updateFacture(id, {
      ...(rest as unknown as Omit<Facture, "id">),
      assignerId: invoice.assignerId,
      statut: nextStatut,
    });
    await loadAll();
  };

  const handleSendPortalLink = async (invoice: FactureUI) => {
    setLoading(true);
    setError(null);
    try {
      await sendFactureByEmail(invoice.id);
      const assigner = assignerOptions.find((item) => item.id === invoice.assignerId);
      const locataireId = assigner?.locataireId;
      const locatairesData = locataires.find((item) => item.id === locataireId);
      alert(`Email envoyé avec succès à ${locatairesData?.email ?? "locataire"}!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'envoi de l'email";
      alert(`Erreur: ${msg}`);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">



      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500 mt-1">
            {proprieteId
              ? `Factures pour ${proprietes.find(p => p.id === proprieteId)?.residence || 'la propriété sélectionnée'}`
              : "Gérez les factures et paiements d'eau"
            }
          </p>
        </div>

        <button onClick={openFormForCreate}
          className="bg-purple-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-800 print:hidden">
          <Plus className="w-5 h-5" />
          Nouvelle facture
        </button>

      </div>




      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-gray-500">Chargement des données...</div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">
                {editingId ? "Modifier la facture" : "Nouvelle facture"}
              </h2>
              <p className="text-sm text-gray-500">
                Complétez les informations puis cliquez sur Enregistrer.
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {!(type === "VARIABLE" && !editingId) && (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Propriété</span>
                  <select
                    value={proprieteId}
                    onChange={(e) => setProprieteId(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2"
                  >
                    <option value="">Sélectionner</option>
                    {proprietes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.residence}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Assignation (Locataire - Appartement)</span>
                  <select
                    value={assignerId}
                    onChange={(e) => setAssignerId(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2"
                  >
                    <option value="">Sélectionner</option>
                    {assignerOptions.filter((a) => !proprieteId || a.proprieteId === proprieteId).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.locataireName} - {a.appartementNom}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Date émission</span>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Date d&apos;échéance</span>
              <input
                type="date"
                value={duetAt}
                onChange={(e) => setDuetAt(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Facture["type"])}
                className="border border-slate-200 rounded-xl px-4 py-2"
              >
                <option value="FIXE">Prix fixe</option>
                <option value="VARIABLE">Variable</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Statut</span>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as Facture["statut"])}
                className="border border-slate-200 rounded-xl px-4 py-2"
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="PAYE">Payée</option>
                <option value="EN_RETARD">En retard</option>
              </select>
            </label>

            {type === "FIXE" ? (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Montant (F)</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border border-slate-200 rounded-xl px-4 py-2"
                />
              </label>
            ) : editingId ? (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Ancien index</span>
                  <input
                    type="number"
                    value={ancienIndex}
                    onChange={(e) => setAncienIndex(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Nouveau index</span>
                  <input
                    type="number"
                    value={nouveauIndex}
                    onChange={(e) => setNouveauIndex(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Prix m³ (F)</span>
                  <input
                    type="number"
                    value={prixM3}
                    onChange={(e) => setPrixM3(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Montant calculé</span>
                  <div className="rounded-xl border border-slate-200 px-4 py-2 bg-gray-50">
                    {calculMontantVariable() || "—"}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {type === "VARIABLE" && !editingId && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Tableau de facture variable</h3>
                  <p className="text-sm text-gray-500">
                    Chaque ligne regroupe le locataire et ses champs d&apos;index sur la même ligne.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700">Prix m³ commun</span>
                    <input
                      type="number"
                      value={globalPrixM3}
                      onChange={(e) => setGlobalPrixM3(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2"
                      placeholder="Ex: 350"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={applyGlobalPrice}
                    className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50"
                  >
                    <BellRing className="w-4 h-4" />
                    Appliquer partout
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextAssigner = variableTableAssigners.find(
                        (assigner) => !variableLineByAssignerId.has(assigner.id)
                      );
                      if (nextAssigner) {
                        addVariableLine(nextAssigner);
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-purple-900 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une ligne
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-80 text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-2 py-2">Locataire - Appartement</th>
                      <th className="px-2 py-2">Ancien index</th>
                      <th className="px-2 py-2">Nouveau index</th>
                      <th className="px-2 py-2">Prix m³ (F)</th>
                      <th className="px-2 py-2">Montant calculé</th>
                      <th className="px-2 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variableTableAssigners.map((assigner) => {
                      const line = variableLineByAssignerId.get(assigner.id);
                      const isAdded = Boolean(line);

                      return (
                        <tr key={assigner.id} className="border-b border-slate-100 bg-white align-top">
                          <td className="px-3 py-3">
                            <div className="font-semibold text-gray-900">{assigner.locataireName}</div>
                            <div className="text-xs text-gray-500">{assigner.appartementNom}</div>
                            <div className="text-xs text-gray-400">
                              {assigner.residence}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={line?.ancienIndex ?? ""}
                              onChange={(e) => updateVariableLine(assigner.id, "ancienIndex", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={line?.nouveauIndex ?? ""}
                              onChange={(e) => updateVariableLine(assigner.id, "nouveauIndex", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={line?.prixM3 ?? globalPrixM3}
                              onChange={(e) => updateVariableLine(assigner.id, "prixM3", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2"
                            />
                          </td>
                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {isAdded ? formatAmount(line?.total ?? 0) : "—"}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {isAdded ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => line && handleSaveVariableLine(line)}
                                  disabled={saving}
                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                  {/* Valider */}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeVariableLine(assigner.id)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                  {/* Annuler */}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-gray-400"></span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {variableTableAssigners.length === 0 && (
                <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-gray-500">
                  Aucune assignation disponible pour cette propriété.
                </div>
              )}
            </section>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-purple-900 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                clearForm();
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Aperçu mensuel
            </h2>
            <p className="text-sm text-gray-500">
              Cliquez sur une grille pour ouvrir les lignes associées.
            </p>
          </div>
        </div>



        <div className="flex flex-col gap-4 mb-6">

          <div className="flex flex-col md:flex-row md:items-center gap-4">

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 print:hidden" />
              <input type="text" placeholder="Rechercher par locataire, appartement..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200 print:hidden" />
            </div>
        


            <span className="px-4 py-2 rounded-xl border border-slate-200 text-sm print:hidden">
              <select
                value={proprieteId}
                onChange={(e) => setProprieteId(e.target.value)}
                className="bg-transparent cursor-pointer"
              >
                <option value="">Toutes les propriétés</option>
                {proprietes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.residence}
                  </option>
                ))}
              </select>

            </span>

          </div>

          <div className="mb-4 flex flex-col gap-3 print:hidden lg:flex-row lg:items-start lg:justify-between">

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => {
                  setFilterStatut(null);
                  setFilterType(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${filterStatut === null && filterType === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-700'
                  }`}
              >
                Toutes ({factures.length})
              </button>

              <button
                onClick={() => {
                  setFilterStatut("PAYE");
                  setFilterType(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === "PAYE"
                    ? 'bg-green-500 text-white'
                    : 'bg-green-50 text-green-700'
                  }`}
              >
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>
                    Payées ({factures.filter(i => i.statut === "PAYE").length})
                  </span>
                </div>
              </button>


              <button
                onClick={() => {
                  setFilterStatut("EN_ATTENTE");
                  setFilterType(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === "EN_ATTENTE"
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-50 text-orange-700'
                  }`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    En attente ({factures.filter(i => i.statut === "EN_ATTENTE").length})
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setFilterStatut("EN_RETARD");
                  setFilterType(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === "EN_RETARD"
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-600'
                  }`}
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    En retard ({factures.filter(i => i.statut === "EN_RETARD").length})
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setFilterType("FIXE");
                  setFilterStatut(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${filterType === "FIXE"
                    ? 'bg-[#8352A5] text-white'
                    : 'bg-purple-50 text-purple-700'
                  }`}
              >
                Prix fixe ({factures.filter(i => i.type === "FIXE").length})
              </button>

              <button
                onClick={() => {
                  setFilterType("VARIABLE");
                  setFilterStatut(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm ${filterType === "VARIABLE"
                    ? 'bg-[#8352A5] text-white'
                    : 'bg-purple-50 text-purple-700'
                  }`}
              >
                Prix variable ({factures.filter(i => i.type === "VARIABLE").length})
              </button>

            </div>

            <div className="flex flex-wrap justify-start gap-2 sm:justify-end lg:max-w-fit">
              <button
                onClick={() => print()}
                className="rounded-xl border border-slate-200 bg-green-100 px-4 py-2 text-sm text-green-600"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Exporter PDF</span>
                </div>
              </button>

              <button className="rounded-xl border border-slate-200 bg-orange-100 px-4 py-2 text-sm text-orange-600">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Rappel groupé</span>
                </div>
              </button>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            {monthCards.map((month) => {
              const active = filterMonth === month.monthKey;
              return (
                <button
                  key={month.monthKey}
                  type="button"
                  onClick={() =>
                    setFilterMonth((current) =>
                      current === month.monthKey ? "" : month.monthKey
                    )
                  }
                  className={`rounded-2xl border text-left transition-all overflow-hidden group ${active
                      ? "border-purple-300 shadow-lg"
                      : "border-slate-100 shadow-sm hover:shadow-lg hover:border-purple-200"
                    }`}
                >
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {month.count} facture{month.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 capitalize">
                      {month.label}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Cliquez pour afficher les factures du mois
                    </p>
                  </div>

                  <div className="bg-white px-5 py-4">
                    <p className="text-xs text-gray-500">Montant total</p>
                    <p className="text-sm font-semibold text-purple-700">
                      {formatAmount(month.total)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>


        </div>

        {invoicesWithNames.length > 0 ? (
          <>
            <div className="hidden md:grid grid-cols-6 text-xs font-semibold text-gray-400 px-4 pb-2">

              <span>LOCATAIRE</span>
              <span>PROPRIÉTÉ</span>
              <span>PÉRIODE</span>
              <span>MONTANT</span>
              <span>STATUT</span>
              <span className="text-right">ACTIONS</span>

            </div>

            <div className="space-y-3">

              {paginatedInvoices.map((invoice) => (

                <div
                  key={invoice.id}
                  className="grid grid-cols-6 items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-4 hover:shadow-md"
                >

                  <div className="flex items-center gap-3">

                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-50">
                      <FileText className="text-orange-600 w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {invoice.locataireName ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {invoice.locataireName ? "" : "Locataire manquant"}
                      </p>
                    </div>

                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {invoice.residence ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {invoice.appartementName ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {formatDate(invoice.issuedAt)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Éch: {formatDate(invoice.duetAt)}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatAmount(invoice.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {invoice.type === "FIXE" ? "Prix fixe" : "Variable"}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutBadge(invoice.statut)}`}
                    >
                      {invoice.statut === "PAYE"
                        ? "Payée"
                        : invoice.statut === "EN_RETARD"
                          ? "En retard"
                          : "En attente"}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSendPortalLink(invoice)}
                      className="p-2 rounded-lg border border-orange-200 hover:bg-emerald-50"
                      title="Envoyer un rappel"
                    >
                      <Send className="w-4 h-4 text-orange-600" />
                    </button>
                    {/* <button
                  onClick={() => alert("Rappel envoyé")}
                  className="p-2 rounded-lg border border-orange-200 hover:bg-orange-50"
                  title="Envoyer un rappel"
                >
                  <BellRing className="w-4 h-4 text-orange-600" />
                </button> */}

                    <button
                      onClick={() => openFormForEdit(invoice)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                      onClick={() => handleMarkPaid(invoice)}
                      className={`p-2 rounded-lg border ${invoice.statut === "PAYE"
                          ? "border-red-200 hover:bg-red-50"
                          : "border-green-200 hover:bg-green-50"
                        }`}
                      title={
                        invoice.statut === "PAYE"
                          ? "Annuler le paiement"
                          : "Marquer comme payée"
                      }
                    >
                      {invoice.statut === "PAYE" ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>

                    {/* <button
                  onClick={() => confirmDelete(invoice)}
                  className="p-2 rounded-lg border border-red-200 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button> */}
                  </div>

                </div>

              ))}

            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              Aucune facture ne correspond aux filtres sélectionnés.
            </p>
          </div>
        )}

        {invoicesWithNames.length > 0 && (
          <div className="mt-5 flex items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-gray-500">
              Page {currentPage} sur {totalPages} - {invoicesWithNames.length} facture(s)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
