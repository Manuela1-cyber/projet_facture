"use client"

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Droplets, Home, Mail, Phone, Receipt, TriangleAlert, Banknote, Wallet, CreditCard, Eye, Building } from "lucide-react";
import { Appartement, Assigner, Facture, Locataire, Propriete, getAppartements, getAssignations, getFactures, getLocataires, getProprietes } from "../../lib/api/facture";

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

export default function Fact() {
  const params = useParams<{ locataireId: string }>();
  const searchParams = useSearchParams();
  const factureIdParam = searchParams?.get("factureId") ?? null;
  const locataireId = Array.isArray(params?.locataireId) ? params.locataireId[0] : params?.locataireId ?? "";

  const [factures, setFactures] = useState<Facture[]>([]);
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [assignations, setAssignations] = useState<Assigner[]>([]);
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  // Scroll vers la facture si factureId est fourni
  useEffect(() => {
    if (factureIdParam) {
      setTimeout(() => {
        const element = document.getElementById(`facture-${factureIdParam}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Mettre un focus/highlight temporaire
          element.classList.add("ring-2", "ring-purple-500");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-purple-500");
          }, 3000);
        }
      }, 500);
    }
  }, [factureIdParam, loading]);

  const locataire = useMemo(
    () => locataires.find((item) => item.id === locataireId),
    [locataireId, locataires]
  );

  // Récupérer les assignations pour ce locataire
  const locataireAssignations = useMemo(
    () => assignations.filter((a) => a.locataireId === locataireId),
    [assignations, locataireId]
  );

  // Récupérer les IDs des assignations pour ultérieur filtreur les factures
  const locataireAssignationIds = useMemo(
    () => locataireAssignations.map((a) => a.id),
    [locataireAssignations]
  );

  const appartement = useMemo(
    () => {
      // Obtenir le premier appartement assigné au locataire
      const assignation = locataireAssignations[0];
      if (!assignation) return undefined;
      return appartements.find((item) => item.id === assignation.appartementId);
    },
    [locataireAssignations, appartements]
  );

  const propriete = useMemo(
    () =>
      proprietes.find(
        (item) => item.id === (appartement?.proprieteId ?? locataire?.proprieteId ?? "")
      ),
    [appartement?.proprieteId, locataire?.proprieteId, proprietes]
  );

  const locataireFactures = useMemo(() => {
    return factures
      .filter((facture) => locataireAssignationIds.includes(facture.assignerId))
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [factures, locataireAssignationIds]);

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
          Chargement de votre espace locataire...
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
            <p className="font-semibold">Impossible de charger votre espace locataire</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!locataire) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          Ce lien ne correspond a aucun locataire connu.
        </div>
      </div>
    );
  }

  return (
    // <div className="bg-gray-50 px-2 py-2 sm:px-4 lg:px-3">
    <div>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

           <div className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-600">Facture</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                Hello {locataire.name} !
              </h1>
             

              <div className="mt-6 hidden gap-3 text-sm text-gray-700 md:flex md:flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2">
                  <Building className="h-4 w-4 text-purple-700" />
                  <span>{propriete?.residence ?? "Residence non renseignee"}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2">
                  <Home className="h-4 w-4 text-orange-600" />
                  <span>{appartement?.nom ?? "Appartement non renseigne"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gray-50 p-5 hidden md:block">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                Vos coordonnees
              </h2>

              <div className="mt-5 space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-700" />
                  <span>{locataire.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-purple-700" />
                  <span>{locataire.email ?? "Email non renseigne"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-orange-600" />
                  <span>{summary.total} facture(s) disponible(s)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {locataireFactures.map((facture) => (
              <article
                id={`facture-${facture.id}`}
                key={facture.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition-all"
              >
                 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4 md:gap-30">
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
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Montant</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatAmount(facture.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-50 md:min-w-[320px] mb-5 md:mb-0 rounded-[20px] border border-slate-200 bg-white p-4">
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
                        <span>Prix m3</span>
                        <span className="font-semibold text-slate-900">
                          {facture.prixM3 != null ? `${facture.prixM3} F` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                <button
                  onClick={() => {
                    const element = document.getElementById(`facture-${facture.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                      element.classList.add("ring-2", "ring-purple-500");
                      setTimeout(() => {
                        element.classList.remove("ring-2", "ring-purple-500");
                      }, 3000);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-green-100 bg-[#8352A5] px-4 py-2 w-full md:w-1/4 hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 text-white" />
                  <p className="uppercase tracking-[0.3em] text-white font-bold">Payer</p>
                </button>
                <button
                  onClick={() => {
                    alert(`Historique de la facture du ${formatDate(facture.issuedAt)}\n\nMontant: ${formatAmount(facture.amount)}\nStatut: ${facture.statut}\nDate d'échéance: ${formatDate(facture.duetAt)}`);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full px-4 py-2 border border-[#8352A5] w-full md:w-1/4 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-[#8352A5]" />
                 <p className="uppercase tracking-[0.3em] text-[#8352A5] font-bold">Historique</p>
                </button>
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
