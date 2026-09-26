"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import PaymentModal from "@/components/paiements/PaymentModal";

interface Reservation {
  id: number | string;
  reservation_number?: string;
  client_name?: string;
  total_amount?: number | string;
}

interface Payment {
  id: number | string;
  reservation?: number | string | null;
  reservation_number?: string | null;
  client_name?: string | null;

  financial_account?: number | string | null;

  amount?: number | string | null;
  payment_date?: string | null;
  method?: string | null;
  reference?: string | null;
  status?: string | null;

  receipt_pdf?: string | null;
}

interface ApiListResponse<T> {
  results?: T[];
}

function getResults<T>(data: T[] | ApiListResponse<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.results) ? data.results : [];
}

function formatMoney(value: number | string | null | undefined): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status?: string | null): string {
  switch (status) {
    case "EN_ATTENTE":
      return "En attente";

    case "VALIDE":
      return "Validé";

    case "ANNULE":
      return "Annulé";

    default:
      return status ?? "—";
  }
}

function getStatusClass(status?: string | null): string {
  switch (status) {
    case "VALIDE":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    case "EN_ATTENTE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";

    case "ANNULE":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}

function getMethodLabel(method?: string | null): string {
  switch (method) {
    case "ESPECES":
      return "Espèces";

    case "VIREMENT":
      return "Virement";

    case "MOBILE_MONEY":
      return "Mobile Money";

    default:
      return method ?? "—";
  }
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Payment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(
        `${API_ROUTES.PAYMENTS}?page_size=100`
      );

      const data = response.data as
        | Payment[]
        | ApiListResponse<Payment>;

      setPaiements(getResults(data));
    } catch (error: unknown) {
      console.error("Erreur chargement paiements :", error);

      setError(
        "Impossible de récupérer les paiements. Vérifiez votre connexion et votre authentification."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      setLoadingReservations(true);

      const response = await api.get(
        `${API_ROUTES.RESERVATIONS}?page_size=1000`
      );

      const data = response.data as
        | Reservation[]
        | ApiListResponse<Reservation>;

      setReservations(getResults(data));
    } catch (error: unknown) {
      console.error(
        "Erreur chargement réservations :",
        error
      );
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setRefreshing(true);

    await Promise.all([
      loadPayments(),
      loadReservations(),
    ]);

    setRefreshing(false);
  }, [loadPayments, loadReservations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalEncaisse = paiements
    .filter((payment) => payment.status === "VALIDE")
    .reduce(
      (total, payment) =>
        total + Number(payment.amount ?? 0),
      0
    );

  const totalPaiements = paiements.length;

  const paiementsValides = paiements.filter(
    (payment) => payment.status === "VALIDE"
  ).length;

  const paiementsEnAttente = paiements.filter(
    (payment) => payment.status === "EN_ATTENTE"
  ).length;

  return (
    <section className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Gestion des paiements
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Suivi des encaissements et règlements des réservations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Actualiser
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />

              Nouveau paiement
            </button>

          </div>
        </div>

        {/* ================================================= */}
        {/* ERREUR */}
        {/* ================================================= */}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* INDICATEURS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total encaissé"
            value={`${formatMoney(totalEncaisse)} FCFA`}
            description="Paiements validés"
            icon={
              <DollarSign className="h-5 w-5" />
            }
          />

          <SummaryCard
            title="Paiements"
            value={totalPaiements}
            description="Tous les paiements"
            icon={
              <CreditCard className="h-5 w-5" />
            }
          />

          <SummaryCard
            title="Validés"
            value={paiementsValides}
            description="Paiements validés"
            icon={
              <CreditCard className="h-5 w-5" />
            }
          />

          <SummaryCard
            title="En attente"
            value={paiementsEnAttente}
            description="Paiements à vérifier"
            icon={
              <CreditCard className="h-5 w-5" />
            }
          />

        </div>

        {/* ================================================= */}
        {/* TABLEAU */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold text-white">
              Liste des paiements
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Paiements enregistrés dans PostgreSQL.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                Chargement des paiements...
              </div>
            </div>
          ) : paiements.length === 0 ? (
            <div className="p-12 text-center">

              <CreditCard className="mx-auto h-12 w-12 text-slate-600" />

              <p className="mt-4 text-lg font-semibold text-white">
                Aucun paiement enregistré
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Les paiements créés depuis une réservation
                apparaîtront ici.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="border-b border-slate-800 bg-slate-950/70">
                  <tr className="text-slate-400">

                    <th className="px-5 py-4 font-medium">
                      #
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Référence
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Réservation
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Client
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Montant
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Mode
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Statut
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70">

                  {paiements.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-800/40"
                    >

                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-white">
                        {payment.reference ??
                          `PAY-${payment.id}`}
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-medium text-blue-400">
                          {payment.reservation_number ??
                            (payment.reservation
                              ? `#${payment.reservation}`
                              : "—")}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {payment.client_name ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-emerald-400">
                        {formatMoney(payment.amount)} FCFA
                      </td>

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {getMethodLabel(payment.method)}
                        </span>

                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                        {formatDate(payment.payment_date)}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reservations={reservations}
        onSuccess={async () => {
          setIsModalOpen(false);
          await loadPayments();
        }}
      />

      {loadingReservations && (
        <div className="fixed bottom-5 right-5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-slate-400 shadow-xl">
          Chargement des réservations...
        </div>
      )}

    </section>
  );
}

function SummaryCard({
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

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

