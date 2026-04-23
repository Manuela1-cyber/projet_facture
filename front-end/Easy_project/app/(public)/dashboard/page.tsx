"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {ArrowRight,Banknote,Bell,Building,Check,FileText,Hourglass,TriangleAlert,Users} from "lucide-react";
import {Appartement,Assigner,Facture,Locataire,Propriete,getAppartements,getAssignations,getFactures,getLocataires,getProprietes} from "../../lib/api/facture";
import { getAuthToken } from "@/lib/api/auth";

function formatAmount(amount: number) {
  return `${amount.toLocaleString()} F`;
}

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

function getMonthKey(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return "Periode inconnue";

  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function statusLabel(statut: Facture["statut"]) {
  switch (statut) {
    case "PAYE":
      return "Payee";
    case "EN_RETARD":
      return "En retard";
    default:
      return "En attente";
  }
}

function statusClasses(statut: Facture["statut"]) {
  switch (statut) {
    case "PAYE":
      return {
        text: "text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700",
        avatar: "bg-emerald-400",
        
      };
    case "EN_RETARD":
      return {
        text: "text-red-600",
        badge: "bg-red-100 text-red-700",
        avatar: "bg-red-400",
        
      };
    default:
      return {
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-700",
        avatar: "bg-orange-400",
        
      };
  }
}

type InvoiceRow = Facture & {
  locataireName: string;
  appartementName: string;
  residence: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [assignations, setAssignations] = useState<Assigner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }

    setIsAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthChecked) {
      return;
    }

    const loadDashboard = async () => {
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

        const results = await Promise.allSettled(tasks.map((task) => task.promise));

        const facturesRes =
          results[0].status === "fulfilled" ? (results[0].value as Facture[]) : [];
        const locatairesRes =
          results[1].status === "fulfilled" ? (results[1].value as Locataire[]) : [];
        const appartementsRes =
          results[2].status === "fulfilled" ? (results[2].value as Appartement[]) : [];
        const proprietesRes =
          results[3].status === "fulfilled" ? (results[3].value as Propriete[]) : [];
        const assignationsRes =
          results[4].status === "fulfilled" ? (results[4].value as Assigner[]) : [];

        const failed = results.find((result) => result.status === "rejected");
        if (failed) {
          const failedIndex = results.findIndex((result) => result.status === "rejected");
          const failedKey = tasks[failedIndex]?.key ?? "inconnu";
          const message =
            failed.reason instanceof Error ? failed.reason.message : String(failed.reason);
          setError(`Erreur chargement API (${failedKey}) : ${message}`);
        }

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

    loadDashboard();
  }, [isAuthChecked]);

  const dashboardData = useMemo(() => {
    const assignerById = new Map(
      assignations.map((assigner) => {
        const locataire = locataires.find((l) => l.id === assigner.locataireId);
        const appartement = appartements.find((a) => a.id === assigner.appartementId);
        const propriete = proprietes.find((p) => p.id === appartement?.proprieteId);
        return [
          assigner.id,
          {
            locataireName: locataire?.name ?? "Locataire inconnu",
            appartementName: appartement?.nom ?? "Appartement inconnu",
            residence: propriete?.residence ?? "Résidence inconnue",
            proprieteId: appartement?.proprieteId ?? "",
          },
        ] as const;
      })
    );

    const invoices: InvoiceRow[] = factures
      .map((facture) => {
        const assignerInfo = assignerById.get(facture.assignerId);

        return {
          ...facture,
          locataireName: assignerInfo?.locataireName ?? "Locataire inconnu",
          appartementName: assignerInfo?.appartementName ?? "Appartement inconnu",
          residence: assignerInfo?.residence ?? "Residence inconnue",
        };
      })
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

    const monthKeys = invoices.map((invoice) => getMonthKey(invoice.issuedAt)).filter(Boolean);
    const currentMonthKey = monthKeys[0] ?? "";
    const currentMonthInvoices = currentMonthKey
      ? invoices.filter((invoice) => getMonthKey(invoice.issuedAt) === currentMonthKey)
      : invoices;

    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidInvoices = invoices.filter((invoice) => invoice.statut === "PAYE");
    const pendingInvoices = invoices.filter((invoice) => invoice.statut === "EN_ATTENTE");
    const lateInvoices = invoices.filter((invoice) => invoice.statut === "EN_RETARD");
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const currentMonthAmount = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const currentMonthPaidInvoices = currentMonthInvoices.filter(
      (invoice) => invoice.statut === "PAYE"
    );
    const currentMonthPaidAmount = currentMonthInvoices
      .filter((invoice) => invoice.statut === "PAYE")
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const occupiedUnits = new Set(assignations.map((a) => a.appartementId)).size;
    const freeUnits = appartements.length - occupiedUnits;

    const recoveryRate =
      currentMonthAmount > 0 ? Math.round((currentMonthPaidAmount / currentMonthAmount) * 100) : 0;

    return {
      invoices,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      lateInvoices,
      paidAmount,
      pendingAmount,
      occupiedUnits,
      freeUnits,
      recoveryRate,
      currentMonthKey,
      currentMonthLabel: currentMonthKey ? getMonthLabel(currentMonthKey) : "Aucune periode",
      currentMonthInvoiceCount: currentMonthInvoices.length,
      currentMonthPaidCount: currentMonthPaidInvoices.length,
      currentMonthAmount,
      currentMonthPaidAmount,
    };
  }, [appartements, factures, locataires, proprietes]);

  const summaryCards = [
    {
      icon: Banknote,
      label: "Facturees ce mois",
      value: formatAmount(dashboardData.currentMonthAmount),
      extra: dashboardData.currentMonthLabel,
      primary: true,
      href: dashboardData.currentMonthKey
        ? `/factures?mois=${encodeURIComponent(dashboardData.currentMonthKey)}`
        : "/factures",
    },
    {
      icon: Check,
      label: "Payées",
      value: String(dashboardData.paidInvoices.length),
      extra: `${formatAmount(dashboardData.paidAmount)} encaissés`,
      primary: false,
      href: "/factures?statut=PAYE",
    },
    {
      icon: Hourglass,
      label: "En attente",
      value: String(dashboardData.pendingInvoices.length),
      extra: `${formatAmount(dashboardData.pendingAmount)} à recouvrer`,
      primary: false,
      href: "/factures?statut=EN_ATTENTE",
    },
    {
      icon: Building,
      label: "Proprietes",
      value: String(proprietes.length),
      extra: `${appartements.length} appartement(s) suivis`,
      primary: false,
      href: "/proprietes",
    },
  ];

  const actions = [
    {
      href: "/factures",
      icon: FileText,
      label: "Gerer les factures",
      iconClassName: "bg-blue-100 text-blue-600",
    },
    {
      href: "/factures",
      icon: Bell,
      label: "Voir les relances",
      iconClassName: "bg-green-100 text-green-600",
    },
    {
      href: "/proprietes",
      icon: Building,
      label: "Ajouter une propriete",
      iconClassName: "bg-violet-100 text-violet-700",
    },
    {
      href: "/locataires",
      icon: Users,
      label: "Ajouter un locataire",
      iconClassName: "bg-orange-100 text-orange-600",
    },
  ];

  if (!isAuthChecked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500">Vue globale de vos proprietes, locataires et factures.</p>
        </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.label}
                    href={card.href}
                    className={
                      card.primary
                        ? "rounded-3xl bg-[#9b5cff] px-6 py-5 text-white transition hover:bg-[#8646ff]"
                        : "rounded-3xl border border-slate-100 bg-white px-6 py-5 transition hover:-translate-y-0.5 hover:border-[#9b5cff]/30 hover:shadow-md"
                    }
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase">
                      <span
                        className={
                          card.primary
                            ? "inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15 text-white"
                            : "inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[#9b5cff]/10 text-[#9b5cff]"
                        }
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={card.primary ? "text-white/80" : "text-gray-500"}>
                        {card.label}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p
                        className={
                          card.primary
                            ? "text-4xl font-extrabold"
                            : "text-3xl font-extrabold text-gray-900"
                        }
                      >
                        {card.value}
                      </p>
                      <p
                        className={
                          card.primary ? "mt-3 text-sm text-white/80" : "mt-3 text-sm text-gray-600"
                        }
                      >
                        {card.extra}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-md"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconClassName}`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="font-semibold text-gray-800">{action.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Taux de recouvrement</h3>
                    <p className="text-sm text-gray-500">
                      {dashboardData.currentMonthLabel} · {dashboardData.currentMonthPaidCount} facture(s)
                      payée(s) sur {dashboardData.currentMonthInvoiceCount}
                    </p>
                  </div>

                  <p className="text-5xl font-extrabold text-[#9b5cff]">
                    {dashboardData.recoveryRate}%
                  </p>
                </div>

                <div className="mt-6">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-[#9b5cff]"
                      style={{ width: `${dashboardData.recoveryRate}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <span>{formatAmount(dashboardData.currentMonthPaidAmount)} payes</span>
                    <span>{formatAmount(dashboardData.currentMonthAmount)} total</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm text-gray-500">Appartements occupes</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {dashboardData.occupiedUnits}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm text-gray-500">Appartements libres</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{dashboardData.freeUnits}</p>
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm text-red-600">Factures en retard</p>
                    <p className="mt-2 text-2xl font-bold text-red-700">
                      {dashboardData.lateInvoices.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Alertes et suivi</h3>
                    <p className="text-sm text-gray-500">
                      Les points d&apos;attention qui meritent une action rapide.
                    </p>
                  </div>
                  <TriangleAlert className="h-6 w-6 text-orange-500" />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-800">Factures en attente</p>
                    <p className="mt-1 text-2xl font-bold text-orange-700">
                      {dashboardData.pendingInvoices.length}
                    </p>
                    <p className="mt-1 text-sm text-orange-700">
                      {formatAmount(dashboardData.pendingAmount)} a encaisser.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">Locataires suivis</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{locataires.length}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Repartis sur {proprietes.length} propriete(s).
                    </p>
                  </div>

                  <Link
                    href="/factures"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#9b5cff] hover:text-[#7f3fff]"
                  >
                    Voir la liste complete des factures
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Dernières factures</h3>
                  <p className="text-sm text-gray-500">
                    Les cinq factures les plus récentes avec leur statut réel.
                  </p>
                </div>

                <Link
                  href="/factures"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#9b5cff] hover:text-[#7f3fff]"
                >
                  Voir toutes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {dashboardData.invoices.slice(0, 5).map((invoice) => {
                  const styles = statusClasses(invoice.statut);

                  return (
                    <div
                      key={invoice.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${styles.avatar}`}
                        >
                          {invoice.locataireName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">{invoice.locataireName}</p>
                          <p className="text-xs text-gray-500">
                            {invoice.residence} · {invoice.appartementName} · {formatDate(invoice.issuedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className={`font-semibold ${styles.text}`}>{formatAmount(invoice.amount)}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs ${styles.badge}`}>
                          {statusLabel(invoice.statut)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {dashboardData.invoices.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    Aucune facture disponible pour le moment.
                  </div>
                )}
              </div>
            </div>
          {/* </> */}
        {/* )} */}
      </div>
    </div>
  );
}
