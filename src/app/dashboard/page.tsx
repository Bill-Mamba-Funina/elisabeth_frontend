"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet,
  Banknote,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

/* ============================================================
   TYPES
============================================================ */

interface Summary {
  total_reservations: number;
  reservations_actives: number;
  reservations_annulees: number;
  reservations_terminees: number;

  chiffre_affaires: number;
  total_encaisse: number;
  total_depenses: number;
  total_rembourse: number;
  reste_a_recouvrer: number;

  solde_comptes: number;
  resultat_net: number;

  total_entrees: number;
  total_sorties: number;
}

interface FinancialAccount {
  id: number;
  name: string;
  account_type: string;
  balance: number;
}

interface PaymentByMethod {
  method: string;
  label: string;
  amount: number;
}

interface ExpenseByCategory {
  category: string;
  label: string;
  amount: number;
}

interface ReservationByStatus {
  status: string;
  label: string;
  count: number;
}

interface MonthlyItem {
  month: string;
  amount: number;
}

interface DashboardData {
  summary: Summary;
  accounts: FinancialAccount[];
  payments_by_method: PaymentByMethod[];
  expenses_by_category: ExpenseByCategory[];
  reservations_by_status: ReservationByStatus[];
  monthly: {
    revenues: MonthlyItem[];
    expenses: MonthlyItem[];
  };
}

/* ============================================================
   VALEURS VIDES
============================================================ */

const EMPTY_SUMMARY: Summary = {
  total_reservations: 0,
  reservations_actives: 0,
  reservations_annulees: 0,
  reservations_terminees: 0,

  chiffre_affaires: 0,
  total_encaisse: 0,
  total_depenses: 0,
  total_rembourse: 0,
  reste_a_recouvrer: 0,

  solde_comptes: 0,
  resultat_net: 0,

  total_entrees: 0,
  total_sorties: 0,
};

const EMPTY_DATA: DashboardData = {
  summary: EMPTY_SUMMARY,
  accounts: [],
  payments_by_method: [],
  expenses_by_category: [],
  reservations_by_status: [],
  monthly: {
    revenues: [],
    expenses: [],
  },
};

/* ============================================================
   HELPERS
============================================================ */

function formatMoney(
  value: number | string | null | undefined
): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatMonth(value?: string): string {
  if (!value) {
    return "—";
  }

  const [year, month] = value.split("-");

  if (!year || !month) {
    return value;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function translateAccountType(value?: string): string {
  const values: Record<string, string> = {
    CAISSE: "Caisse",
    BANQUE: "Banque",
    MOBILE_MONEY: "Mobile Money",
  };

  return values[value ?? ""] ?? value ?? "Compte";
}

function getStatusClass(status?: string): string {
  switch (status) {
    case "CONFIRMEE":
    case "VALIDE":
    case "PAYE":
      return "bg-emerald-500/10 text-emerald-400";

    case "EN_ATTENTE":
    case "PARTIEL":
      return "bg-amber-500/10 text-amber-400";

    case "ANNULEE":
    case "ANNULE":
      return "bg-red-500/10 text-red-400";

    case "EN_COURS":
      return "bg-blue-500/10 text-blue-400";

    case "TERMINEE":
    case "CLOTUREE":
      return "bg-slate-500/10 text-slate-300";

    default:
      return "bg-slate-500/10 text-slate-300";
  }
}

/* ============================================================
   PAGE DASHBOARD
============================================================ */

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData>(EMPTY_DATA);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================================
     CHARGEMENT
  ========================================================== */

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(
        API_ROUTES.DASHBOARD
      );

      const payload = response.data;

      setData({
        summary: {
          ...EMPTY_SUMMARY,
          ...(payload?.summary ?? {}),
        },

        accounts: Array.isArray(payload?.accounts)
          ? payload.accounts
          : [],

        payments_by_method: Array.isArray(
          payload?.payments_by_method
        )
          ? payload.payments_by_method
          : [],

        expenses_by_category: Array.isArray(
          payload?.expenses_by_category
        )
          ? payload.expenses_by_category
          : [],

        reservations_by_status: Array.isArray(
          payload?.reservations_by_status
        )
          ? payload.reservations_by_status
          : [],

        monthly: {
          revenues: Array.isArray(
            payload?.monthly?.revenues
          )
            ? payload.monthly.revenues
            : [],

          expenses: Array.isArray(
            payload?.monthly?.expenses
          )
            ? payload.monthly.expenses
            : [],
        },
      });
    } catch (err) {
      console.error(
        "Erreur chargement dashboard :",
        err
      );

      setError(
        "Impossible de récupérer les données du tableau de bord."
      );

      setData(EMPTY_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /* ==========================================================
     ACTUALISATION
  ========================================================== */

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  /* ==========================================================
     SOLDE TOTAL
  ========================================================== */

  const totalBalance = useMemo(() => {
    return data.accounts.reduce(
      (total, account) =>
        total + Number(account.balance ?? 0),
      0
    );
  }, [data.accounts]);

  /* ==========================================================
     EXPORTS
  ========================================================== */

  const exportFile = (
    type: "excel" | "pdf"
  ) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "http://127.0.0.1:8000/api";

    const route =
      type === "excel"
        ? "/dashboard/export/excel/"
        : "/dashboard/export/pdf/";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const url = `${baseUrl}${route}`;

    /*
     * window.open ne permet pas d'envoyer simplement
     * le Bearer Authorization.
     *
     * On utilise donc un téléchargement via fetch
     * avec le token JWT.
     */
    void (async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        if (!response.ok) {
          throw new Error(
            `Erreur export ${response.status}`
          );
        }

        const blob = await response.blob();

        const blobUrl =
          window.URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = blobUrl;

        link.download =
          type === "excel"
            ? "rapport-elisabeth.xlsx"
            : "rapport-elisabeth.pdf";

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error(
          "Erreur téléchargement rapport :",
          err
        );

        setError(
          "Impossible de télécharger le rapport."
        );
      }
    })();
  };

  /* ==========================================================
     CHARGEMENT
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />

            <p className="text-sm text-slate-400">
              Chargement du tableau de bord...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { summary } = data;

  /* ==========================================================
     AFFICHAGE
  ========================================================== */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Tableau de bord
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Pilotage global de La Casa da Festa Elisabeth
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => exportFile("excel")}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <FileSpreadsheet className="h-4 w-4" />

              Télécharger Excel
            </button>

            <button
              type="button"
              onClick={() => exportFile("pdf")}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <FileText className="h-4 w-4" />

              Télécharger PDF
            </button>

            <button
              type="button"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Actualiser
            </button>

          </div>
        </section>

        {/* ==================================================
            ERREUR
        ================================================== */}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p className="text-sm">
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            STATISTIQUES
        ================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            title="Réservations"
            value={summary.total_reservations}
            description={`${summary.reservations_actives} active(s)`}
            icon={
              <CalendarDays className="h-5 w-5" />
            }
          />

          <DashboardCard
            title="Encaissements"
            value={`${formatMoney(
              summary.total_encaisse
            )} $`}
            description="Paiements validés"
            icon={
              <TrendingUp className="h-5 w-5" />
            }
          />

          <DashboardCard
            title="Dépenses"
            value={`${formatMoney(
              summary.total_depenses
            )} $`}
            description="Dépenses enregistrées"
            icon={
              <TrendingDown className="h-5 w-5" />
            }
          />

          <DashboardCard
            title="Solde financier"
            value={`${formatMoney(
              totalBalance
            )} $`}
            description={`${data.accounts.length} compte(s) actif(s)`}
            icon={
              <Wallet className="h-5 w-5" />
            }
          />

        </section>

        {/* ==================================================
            INDICATEURS FINANCIERS
        ================================================== */}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <FinancialCard
            title="Chiffre d'affaires"
            value={summary.chiffre_affaires}
            icon={
              <TrendingUp className="h-5 w-5" />
            }
          />

          <FinancialCard
            title="Reste à recouvrer"
            value={summary.reste_a_recouvrer}
            icon={
              <CreditCard className="h-5 w-5" />
            }
          />

          <FinancialCard
            title="Résultat net"
            value={summary.resultat_net}
            icon={
              <Activity className="h-5 w-5" />
            }
          />

        </section>

        {/* ==================================================
            RÉSERVATIONS PAR STATUT
        ================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">

          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              État des réservations
            </h2>

            <p className="text-sm text-slate-400">
              Répartition réelle des réservations
            </p>
          </div>

          {data.reservations_by_status.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

              {data.reservations_by_status.map(
                (item) => (
                  <StatusBox
                    key={item.status}
                    label={item.label}
                    value={item.count}
                    status={item.status}
                  />
                )
              )}

            </div>
          ) : (
            <EmptyBox text="Aucune réservation enregistrée." />
          )}

        </section>

        {/* ==================================================
            COMPTES
        ================================================== */}

        <section>

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Comptes financiers
            </h2>

            <p className="text-sm text-slate-400">
              Situation actuelle des comptes
            </p>
          </div>

          {data.accounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {data.accounts.map(
                (account) => {

                  const accountType =
                    account.account_type;

                  const icon =
                    accountType === "BANQUE"
                      ? (
                        <Banknote className="h-5 w-5" />
                      )
                      : accountType ===
                        "MOBILE_MONEY"
                      ? (
                        <Smartphone className="h-5 w-5" />
                      )
                      : (
                        <Wallet className="h-5 w-5" />
                      );

                  return (
                    <div
                      key={account.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex items-center gap-3">

                          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                            {icon}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {account.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {translateAccountType(
                                accountType
                              )}
                            </p>
                          </div>

                        </div>

                        <span className="text-xs text-emerald-400">
                          Actif
                        </span>

                      </div>

                      <p className="mt-5 text-2xl font-bold">
                        {formatMoney(
                          account.balance
                        )}{" "}
                        $
                      </p>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900">
              <EmptyBox text="Aucun compte financier enregistré." />
            </div>
          )}

        </section>

        {/* ==================================================
            GRAPHIQUES
        ================================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <ChartCard
            title="Encaissements mensuels"
            data={data.monthly.revenues}
            type="revenue"
          />

          <ChartCard
            title="Dépenses mensuelles"
            data={data.monthly.expenses}
            type="expense"
          />

        </section>

        {/* ==================================================
            PAIEMENTS / DÉPENSES
        ================================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <DataListCard
            title="Paiements par mode"
            description="Répartition des encaissements validés"
            icon={
              <CreditCard className="h-5 w-5 text-blue-400" />
            }
            emptyText="Aucun paiement validé."
          >

            {data.payments_by_method.map(
              (item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                >

                  <div>
                    <p className="font-medium">
                      {item.label}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.method}
                    </p>
                  </div>

                  <p className="font-semibold text-emerald-400">
                    {formatMoney(
                      item.amount
                    )}{" "}
                    $
                  </p>

                </div>
              )
            )}

          </DataListCard>

          <DataListCard
            title="Dépenses par catégorie"
            description="Répartition réelle des dépenses"
            icon={
              <TrendingDown className="h-5 w-5 text-red-400" />
            }
            emptyText="Aucune dépense enregistrée."
          >

            {data.expenses_by_category.map(
              (item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                >

                  <div>
                    <p className="font-medium">
                      {item.label}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.category}
                    </p>
                  </div>

                  <p className="font-semibold text-red-400">
                    {formatMoney(
                      item.amount
                    )}{" "}
                    $
                  </p>

                </div>
              )
            )}

          </DataListCard>

        </section>

        {/* ==================================================
            MOUVEMENTS
        ================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Mouvements financiers
              </h2>

              <p className="text-sm text-slate-400">
                Synthèse des entrées et sorties
              </p>
            </div>

            <Activity className="h-5 w-5 text-slate-500" />

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <MovementCard
              title="Total entrées"
              value={summary.total_entrees}
              income
              icon={
                <ArrowUpCircle className="h-5 w-5" />
              }
            />

            <MovementCard
              title="Total sorties"
              value={summary.total_sorties}
              icon={
                <ArrowDownCircle className="h-5 w-5" />
              }
            />

            <MovementCard
              title="Remboursements"
              value={summary.total_rembourse}
              icon={
                <CreditCard className="h-5 w-5" />
              }
            />

          </div>

        </section>

        {/* ==================================================
            SYNTHÈSE
        ================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Synthèse de l'activité
            </h2>

            <p className="text-sm text-slate-400">
              Données calculées directement depuis PostgreSQL
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            <MiniStat
              label="Réservations"
              value={summary.total_reservations}
            />

            <MiniStat
              label="Actives"
              value={summary.reservations_actives}
            />

            <MiniStat
              label="Annulées"
              value={summary.reservations_annulees}
            />

            <MiniStat
              label="Terminées"
              value={summary.reservations_terminees}
            />

          </div>

        </section>

      </div>
    </main>
  );
}

/* ============================================================
   COMPOSANTS
============================================================ */

function DashboardCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

function FinancialCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          {icon}
        </div>

        <p className="text-sm text-slate-400">
          {title}
        </p>

      </div>

      <p className="mt-4 text-2xl font-bold">
        {formatMoney(value)} $
      </p>

    </div>
  );
}

function StatusBox({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      {status && (
        <span
          className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] ${getStatusClass(
            status
          )}`}
        >
          {label}
        </span>
      )}

    </div>
  );
}

function MovementCard({
  title,
  value,
  icon,
  income = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  income?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

      <div
        className={`flex items-center gap-2 ${
          income
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {icon}

        <span className="text-sm">
          {title}
        </span>
      </div>

      <p className="mt-3 text-xl font-bold">
        {formatMoney(value)} $
      </p>

    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>

    </div>
  );
}

function EmptyBox({
  text,
}: {
  text: string;
}) {
  return (
    <div className="py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function DataListCard({
  title,
  description,
  icon,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasChildren =
    Array.isArray(children)
      ? children.length > 0
      : Boolean(children);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="mb-5 flex items-center gap-3">

        {icon}

        <div>
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <p className="text-sm text-slate-400">
            {description}
          </p>
        </div>

      </div>

      {hasChildren ? (
        <div className="space-y-3">
          {children}
        </div>
      ) : (
        <EmptyBox text={emptyText} />
      )}

    </section>
  );
}

function ChartCard({
  title,
  data,
  type,
}: {
  title: string;
  data: MonthlyItem[];
  type: "revenue" | "expense";
}) {
  const maxValue = Math.max(
    ...data.map(
      (item) => Number(item.amount ?? 0)
    ),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        <p className="text-sm text-slate-400">
          Données issues des opérations financières
        </p>
      </div>

      {data.length === 0 ? (
        <EmptyBox text="Aucune donnée disponible pour le graphique." />
      ) : (
        <div className="flex h-64 items-end gap-3 overflow-x-auto">

          {data.map((item) => {

            const value =
              Number(item.amount ?? 0);

            const height = Math.max(
              (value / maxValue) * 190,
              value > 0 ? 8 : 2
            );

            return (
              <div
                key={item.month}
                className="flex min-w-[60px] flex-1 flex-col items-center justify-end gap-2"
              >

                <span className="text-[10px] text-slate-400">
                  {formatMoney(value)} $
                </span>

                <div
                  className={`w-full max-w-[42px] rounded-t-md ${
                    type === "revenue"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    height: `${height}px`,
                  }}
                />

                <span className="max-w-[75px] truncate text-[11px] text-slate-500">
                  {formatMonth(item.month)}
                </span>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

