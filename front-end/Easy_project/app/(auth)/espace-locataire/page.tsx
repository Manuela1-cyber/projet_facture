"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Droplets, Home, Mail, Phone, Receipt, TriangleAlert } from "lucide-react";
import { Appartement, Assigner, Facture, Locataire, Propriete, buildLocatairePortalPath,buildLocatairePortalPath1, getAppartements, getAssignations, getFactures, getLocataires, getProprietes } from "../../lib/api/facture";

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
  if (amount == null) return "0 F";
  return `${amount.toLocaleString()} F`;
}

function statutClasses(statut: Facture["statut"]) {
  switch (statut) {
    case "PAYE":
      return "bg-emerald-50 text-emerald-700";
    case "EN_RETARD":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function EspaceLocatairePreviewPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [assignations, setAssignations] = useState<Assigner[]>([]);
  const [selectedLocataireId, setSelectedLocataireId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortalData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [facturesRes, locatairesRes, appartementsRes, proprietesRes, assignationsRes] = await Promise.all([
          getFactures(),
          getLocataires(),
          getAppartements(),
          getProprietes(),
          getAssignations(),
        ]);

        setFactures(facturesRes);
        setLocataires(locatairesRes);
        setAppartements(appartementsRes);
        setProprietes(proprietesRes);
        setAssignations(assignationsRes);
        setSelectedLocataireId((current) => current || locatairesRes[0]?.id || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  const selectedLocataire = useMemo(
    () => locataires.find((item) => item.id === selectedLocataireId),
    [locataires, selectedLocataireId]
  );

  // Récupérer les assignations pour ce locataire
  const selectedLocataireAssignations = useMemo(
    () => assignations.filter((a) => a.locataireId === selectedLocataireId),
    [assignations, selectedLocataireId]
  );

  // Récupérer les IDs des assignations pour filtrer les factures
  const selectedLocataireAssignationIds = useMemo(
    () => selectedLocataireAssignations.map((a) => a.id),
    [selectedLocataireAssignations]
  );

  const appartement = useMemo(
    () => {
      // Obtenir le premier appartement assigné au locataire
      const assignation = selectedLocataireAssignations[0];
      if (!assignation) return undefined;
      return appartements.find((item) => item.id === assignation.appartementId);
    },
    [selectedLocataireAssignations, appartements]
  );

  const propriete = useMemo(
    () =>
      proprietes.find(
        (item) => item.id === (appartement?.proprieteId ?? selectedLocataire?.proprieteId ?? "")
      ),
    [appartement?.proprieteId, proprietes, selectedLocataire?.proprieteId]
  );

  const locataireFactures = useMemo(() => {
    return factures
      .filter((facture) => selectedLocataireAssignationIds.includes(facture.assignerId))
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [factures, selectedLocataireAssignationIds]);

  const summary = useMemo(() => {
    return {
      total: locataireFactures.length,
      payees: locataireFactures.filter((item) => item.statut === "PAYE").length,
      enAttente: locataireFactures.filter((item) => item.statut === "EN_ATTENTE").length,
      enRetard: locataireFactures.filter((item) => item.statut === "EN_RETARD").length,
      montantTotal: locataireFactures.reduce((sum, item) => sum + item.amount, 0),
    };
  }, [locataireFactures]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Chargement de l'espace locataire...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Impossible de charger l'espace locataire</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedLocataire) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          Aucun locataire disponible pour l'instant.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-purple-700">Apercu administrateur</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                Apercu de l&apos;espace locataire
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Cette page sert seulement a previsualiser l&apos;interface. Le vrai lien locataire est celui du bouton ci-dessous.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:min-w-[320px]">
              <label className="text-sm font-medium text-gray-700">Choisir un locataire</label>
              <select
                value={selectedLocataireId}
                onChange={(e) => setSelectedLocataireId(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-700"
              >
                {locataires.map((locataire) => (
                  <option key={locataire.id} value={locataire.id}>
                    {locataire.name}
                  </option>
                ))}
              </select>
              <Link
                href={buildLocatairePortalPath(selectedLocataire.id)}
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Ouvrir le vrai espace locataire
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={buildLocatairePortalPath1(selectedLocataire.id)}
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Ouvrir la facture
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-xl">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-600">Interface locataire</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                Bonjour {selectedLocataire.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Retrouvez ici l'historique complet de vos factures d'eau, leur statut et les details de consommation de votre logement.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-700">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-4 py-2">
                  <Home className="h-4 w-4 text-purple-700" />
                  <span>{propriete?.residence ?? "Residence non renseignee"}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Droplets className="h-4 w-4 text-orange-600" />
                  <span>{appartement?.nom ?? "Appartement non renseigne"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gray-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                Vos coordonnees
              </h2>
              <div className="mt-5 space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-700" />
                  <span>{selectedLocataire.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-purple-700" />
                  <span>{selectedLocataire.email ?? "Email non renseigne"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-orange-600" />
                  <span>{summary.total} facture(s) disponible(s)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Factures totales</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.total}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Payees</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-600">{summary.payees}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">En attente</p>
            <p className="mt-3 text-3xl font-semibold text-amber-600">{summary.enAttente}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Montant cumule</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {formatAmount(summary.montantTotal)}
            </p>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Historique des factures
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consultez chaque facture, son echeance et les details de consommation.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
              <CalendarDays className="h-4 w-4" />
              Mise a jour en temps reel
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {locataireFactures.map((facture) => (
              <article
                key={facture.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Facture du {formatDate(facture.issuedAt)}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statutClasses(
                          facture.statut
                        )}`}
                      >
                        {facture.statut === "PAYE"
                          ? "Payee"
                          : facture.statut === "EN_RETARD"
                          ? "En retard"
                          : "En attente"}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Montant</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatAmount(facture.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Type</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {facture.type === "FIXE" ? "Prix fixe" : "Prix variable"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Emission</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatDate(facture.issuedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Echeance</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatDate(facture.duetAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-55 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Consommation
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span>Ancien index</span>
                        <span className="font-semibold text-slate-900">
                          {facture.ancienIndex ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Nouveau index</span>
                        <span className="font-semibold text-slate-900">
                          {facture.nouveauIndex ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Prix m³</span>
                        <span className="font-semibold text-slate-900">
                          {facture.prixM3 != null ? `${facture.prixM3} F` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {locataireFactures.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                Aucune facture disponible pour le moment.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
