"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, TriangleAlert } from "lucide-react";
import { Facture, getFactureById, getFactureForPortal } from "../../../lib/api/facture";

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

export default function EspaceLocatairePage() {
  const params = useParams<{ locataireId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const factureId = searchParams.get("factureId") ?? "";
  const locataireId = Array.isArray(params?.locataireId) ? params.locataireId[0] : params?.locataireId ?? "";

  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factureId) {
      router.replace(`/fact/${locataireId}`);
      return;
    }

    const loadPortalData = async () => {
      setLoading(true);
      setError(null);

      try {
        try {
          const factureRes = await getFactureForPortal(factureId, locataireId);
          setFacture(factureRes);
        } catch {
       
          const factureRes = await getFactureById(factureId);
          setFacture(factureRes);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Impossible de charger la facture.");
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, [factureId, locataireId, router]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-slate-100 px-6 py-10">
  //       <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
  //         Chargement de votre espace locataire...
  //       </div>
  //     </div>
  //   );
  // }

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

  if (!facture) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          Aucune facture trouvée avec ce lien.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-xl">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-600">Espace locataire</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                Votre facture d&apos;eau
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Consultez votre facture en toute sécurité depuis ce lien.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-gray-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                Informations facture
              </h2>

              <div className="mt-5 space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Statut:</span>
                  <span>{facture.statut === "PAYE" ? "Payee" : facture.statut === "EN_RETARD" ? "En retard" : "En attente"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">Montant:</span>
                  <span>{formatAmount(facture.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Détail de la facture
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Montant, échéance et consommation.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
              <CalendarDays className="h-4 w-4" />
              Mise a jour en temps reel
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <article className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
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

                <div className="min-w-[220px] rounded-[20px] border border-slate-200 bg-white p-4">
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
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
