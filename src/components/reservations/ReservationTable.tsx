"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Edit,
  EllipsisVertical,
  Loader2,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

type PaymentMethod =
  | "ESPECES"
  | "VIREMENT"
  | "MOBILE_MONEY";

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "ESPECES",
    label: "Espèces",
  },
  {
    value: "VIREMENT",
    label: "Virement bancaire",
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
  },
];

interface ReservationClient {
  id?: number | string;
  full_name?: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface Reservation {
  id: number | string;
  reference: string;

  client: string | ReservationClient;

  client_full_name?: string;
  client_phone?: string;
  client_address?: string;
  client_data?: ReservationClient;

  title?: string;
  titre?: string;
  event_type?: string;

  date?: string;
  reservation_date?: string;
  event_date?: string;

  statut: string;

  montant: number | string;

  montantPaye?: number | string;
  resteAPayer?: number | string;

  paymentStatus?:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE";
}

interface ReservationTableProps {
  reservations: Reservation[];
  onRefresh?: () => void | Promise<void>;
}

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
};

function getStatusClass(status: string): string {
  switch (status) {
    case "CONFIRMEE":
      return "bg-emerald-100 text-emerald-700";

    case "EN_COURS":
      return "bg-blue-100 text-blue-700";

    case "TERMINEE":
      return "bg-purple-100 text-purple-700";

    case "CLOTUREE":
      return "bg-slate-200 text-slate-700";

    case "ANNULEE":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getPaymentStatusClass(status: string): string {
  switch (status) {
    case "PAYE":
      return "bg-emerald-100 text-emerald-700";

    case "PARTIEL":
      return "bg-amber-100 text-amber-700";

    case "NON_PAYE":
    default:
      return "bg-red-100 text-red-700";
  }
}

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case "PAYE":
      return "Payé";

    case "PARTIEL":
      return "Partiel";

    case "NON_PAYE":
    default:
      return "Non payé";
  }
}

function getClientName(reservation: Reservation): string {
  if (typeof reservation.client === "string") {
    return (
      reservation.client_full_name ||
      reservation.client ||
      "Client inconnu"
    );
  }

  return (
    reservation.client_full_name ||
    reservation.client?.full_name ||
    reservation.client?.name ||
    "Client inconnu"
  );
}

function getClientPhone(reservation: Reservation): string {
  if (reservation.client_phone) {
    return reservation.client_phone;
  }

  if (reservation.client_data?.phone) {
    return reservation.client_data.phone;
  }

  if (
    typeof reservation.client !== "string" &&
    reservation.client?.phone
  ) {
    return reservation.client.phone;
  }

  return "";
}

function getClientAddress(reservation: Reservation): string {
  if (reservation.client_address) {
    return reservation.client_address;
  }

  if (reservation.client_data?.address) {
    return reservation.client_data.address;
  }

  if (
    typeof reservation.client !== "string" &&
    reservation.client?.address
  ) {
    return reservation.client.address;
  }

  return "";
}

function getReservationTitle(
  reservation: Reservation
): string {
  return (
    reservation.titre ||
    reservation.title ||
    reservation.event_type ||
    "Réservation"
  );
}

function getReservationDate(
  reservation: Reservation
): string {
  return (
    reservation.date ||
    reservation.reservation_date ||
    reservation.event_date ||
    ""
  );
}

function normalizeDate(value: string): string {
  if (!value) {
    return "";
  }

  // Format ISO :
  // 2026-09-30
  // 2026-09-30T10:00:00Z
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.substring(0, 10);
  }

  // Format français :
  // 30/09/2026
  const frenchMatch = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (frenchMatch) {
    return `${frenchMatch[3]}-${frenchMatch[2]}-${frenchMatch[1]}`;
  }

  return "";
}

function getWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");

  if (!cleaned) {
    return "";
  }

  return `https://wa.me/${cleaned}`;
}

function extractApiError(
  error: unknown,
  fallback: string
): string {
  const axiosError = error as {
    response?: {
      data?: unknown;
    };
    message?: string;
  };

  const data = axiosError.response?.data;

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const entries = Object.entries(
      data as Record<string, unknown>
    );

    const messages = entries.map(
      ([field, value]) => {
        if (Array.isArray(value)) {
          return `${field} : ${value.join(", ")}`;
        }

        if (
          typeof value === "object" &&
          value !== null
        ) {
          return `${field} : ${JSON.stringify(value)}`;
        }

        return `${field} : ${String(value)}`;
      }
    );

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return axiosError.message || fallback;
}

export default function ReservationTable({
  reservations,
  onRefresh,
}: ReservationTableProps) {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("TOUS");

  const [paymentFilter, setPaymentFilter] =
    useState("TOUS");

  const [dayFilter, setDayFilter] =
    useState("TOUS");

  const [monthFilter, setMonthFilter] =
    useState("TOUS");

  const [yearFilter, setYearFilter] =
    useState("TOUS");

  const [exactDateFilter, setExactDateFilter] =
    useState("");

  const [
    paymentReservationId,
    setPaymentReservationId,
  ] = useState<number | string | null>(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("ESPECES");

  const [
    processingPayment,
    setProcessingPayment,
  ] = useState<number | string | null>(null);

  const [
    processingDelete,
    setProcessingDelete,
  ] = useState<number | string | null>(null);

  const [
    cancellingReservation,
    setCancellingReservation,
  ] = useState<number | string | null>(null);

  const [
    openActionMenu,
    setOpenActionMenu,
  ] = useState<number | string | null>(null);

  const [error, setError] = useState("");

  // ==========================================================
  // ANNÉES DISPONIBLES
  // ==========================================================

  const availableYears = useMemo(() => {
    const years = new Set<string>();

    reservations.forEach((reservation) => {
      const date = normalizeDate(
        getReservationDate(reservation)
      );

      if (date) {
        years.add(date.substring(0, 4));
      }
    });

    return Array.from(years).sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [reservations]);

  // ==========================================================
  // FILTRAGE
  // ==========================================================

  const filteredReservations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const reservationDate = normalizeDate(
        getReservationDate(reservation)
      );

      const clientName =
        getClientName(reservation);

      const clientPhone =
        getClientPhone(reservation);

      const title =
        getReservationTitle(reservation);

      const matchesSearch =
        !term ||
        reservation.reference
          .toLowerCase()
          .includes(term) ||
        clientName
          .toLowerCase()
          .includes(term) ||
        clientPhone
          .toLowerCase()
          .includes(term) ||
        title
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "TOUS" ||
        reservation.statut === statusFilter;

      const matchesPayment =
        paymentFilter === "TOUS" ||
        reservation.paymentStatus ===
          paymentFilter;

      const matchesExactDate =
        !exactDateFilter ||
        reservationDate === exactDateFilter;

      const reservationYear =
        reservationDate
          ? reservationDate.substring(0, 4)
          : "";

      const reservationMonth =
        reservationDate
          ? reservationDate.substring(5, 7)
          : "";

      const reservationDay =
        reservationDate
          ? reservationDate.substring(8, 10)
          : "";

      const matchesYear =
        yearFilter === "TOUS" ||
        reservationYear === yearFilter;

      const matchesMonth =
        monthFilter === "TOUS" ||
        reservationMonth === monthFilter;

      const matchesDay =
        dayFilter === "TOUS" ||
        reservationDay === dayFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesExactDate &&
        matchesYear &&
        matchesMonth &&
        matchesDay
      );
    });
  }, [
    reservations,
    search,
    statusFilter,
    paymentFilter,
    dayFilter,
    monthFilter,
    yearFilter,
    exactDateFilter,
  ]);

  // ==========================================================
  // RÉINITIALISER FILTRES
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("TOUS");
    setPaymentFilter("TOUS");
    setDayFilter("TOUS");
    setMonthFilter("TOUS");
    setYearFilter("TOUS");
    setExactDateFilter("");
  }

  // ==========================================================
  // OUVRIR PAIEMENT
  // ==========================================================

  function openPayment(
    reservation: Reservation
  ) {
    const montant = Number(
      reservation.montant || 0
    );

    const montantPaye = Number(
      reservation.montantPaye || 0
    );

    const remaining = Math.max(
      0,
      Number(
        reservation.resteAPayer ??
          montant - montantPaye
      )
    );

    setPaymentReservationId(
      reservation.id
    );

    setPaymentAmount(
      remaining.toFixed(2)
    );

    setPaymentMethod("ESPECES");
    setError("");
    setOpenActionMenu(null);
  }

  // ==========================================================
  // FERMER PAIEMENT
  // ==========================================================

  function closePayment() {
    setPaymentReservationId(null);
    setPaymentAmount("");
    setPaymentMethod("ESPECES");
  }

  // ==========================================================
  // ENREGISTRER PAIEMENT
  // ==========================================================

  async function handlePayment(
    reservation: Reservation
  ) {
    const amount = Number(paymentAmount);

    const montant = Number(
      reservation.montant || 0
    );

    const montantPaye = Number(
      reservation.montantPaye || 0
    );

    const remaining = Math.max(
      0,
      Number(
        reservation.resteAPayer ??
          montant - montantPaye
      )
    );

    if (!amount || amount <= 0) {
      setError(
        "Veuillez saisir un montant valide."
      );
      return;
    }

    if (amount > remaining) {
      setError(
        `Le paiement ne peut pas dépasser le reste à payer de ${remaining.toLocaleString(
          "fr-FR"
        )} $.`
      );
      return;
    }

    try {
      setProcessingPayment(
        reservation.id
      );

      setError("");

      await api.post(
        API_ROUTES.PAYMENTS,
        {
          reservation: Number(
            reservation.id
          ),
          amount: amount.toFixed(2),
          method: paymentMethod,
          reference: "",
        }
      );

      closePayment();

      await onRefresh?.();
    } catch (err: unknown) {
      console.error(
        "Erreur paiement :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible d'enregistrer le paiement."
        )
      );
    } finally {
      setProcessingPayment(null);
    }
  }

  // ==========================================================
  // ANNULER RÉSERVATION
  // ==========================================================

  async function handleCancel(
    reservation: Reservation
  ) {
    if (reservation.statut === "ANNULEE") {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment annuler la réservation ${reservation.reference} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingReservation(
        reservation.id
      );

      setError("");

      await api.patch(
        `${API_ROUTES.RESERVATIONS}${reservation.id}/`,
        {
          status: "ANNULEE",
        }
      );

      setOpenActionMenu(null);

      await onRefresh?.();
    } catch (err: unknown) {
      console.error(
        "Erreur annulation :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible d'annuler la réservation."
        )
      );
    } finally {
      setCancellingReservation(null);
    }
  }

  // ==========================================================
  // SUPPRIMER RÉSERVATION
  // ==========================================================

  async function handleDelete(
    reservation: Reservation
  ) {
    const confirmed = window.confirm(
      `Voulez-vous supprimer définitivement la réservation ${reservation.reference} ?\n\nCette opération peut être refusée si la réservation possède déjà des paiements.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingDelete(
        reservation.id
      );

      setError("");

      await api.delete(
        `${API_ROUTES.RESERVATIONS}${reservation.id}/`
      );

      setOpenActionMenu(null);

      await onRefresh?.();
    } catch (err: unknown) {
      console.error(
        "Erreur suppression :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible de supprimer la réservation."
        )
      );
    } finally {
      setProcessingDelete(null);
    }
  }

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      {/* =====================================================
          FILTRES
      ====================================================== */}

      <div className="border-b border-slate-800 p-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_180px]">
          {/* RECHERCHE */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher par référence, client, téléphone ou titre..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* STATUT */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
              Tous les statuts
            </option>

            <option value="EN_ATTENTE">
              En attente
            </option>

            <option value="CONFIRMEE">
              Confirmée
            </option>

            <option value="EN_COURS">
              En cours
            </option>

            <option value="TERMINEE">
              Terminée
            </option>

            <option value="CLOTUREE">
              Clôturée
            </option>

            <option value="ANNULEE">
              Annulée
            </option>
          </select>

          {/* PAIEMENT */}

          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
              Tous les paiements
            </option>

            <option value="NON_PAYE">
              Non payé
            </option>

            <option value="PARTIEL">
              Partiel
            </option>

            <option value="PAYE">
              Payé
            </option>
          </select>

          {/* DATE EXACTE */}

          <input
            type="date"
            value={exactDateFilter}
            onChange={(event) =>
              setExactDateFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            title="Filtrer par date exacte"
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* JOUR */}

          <select
            value={dayFilter}
            onChange={(event) =>
              setDayFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
              Tous les jours
            </option>

            {Array.from(
              { length: 31 },
              (_, index) => {
                const day = String(
                  index + 1
                ).padStart(2, "0");

                return (
                  <option
                    key={day}
                    value={day}
                  >
                    Jour {day}
                  </option>
                );
              }
            )}
          </select>

          {/* MOIS */}

          <select
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
              Tous les mois
            </option>

            <option value="01">
              Janvier
            </option>

            <option value="02">
              Février
            </option>

            <option value="03">
              Mars
            </option>

            <option value="04">
              Avril
            </option>

            <option value="05">
              Mai
            </option>

            <option value="06">
              Juin
            </option>

            <option value="07">
              Juillet
            </option>

            <option value="08">
              Août
            </option>

            <option value="09">
              Septembre
            </option>

            <option value="10">
              Octobre
            </option>

            <option value="11">
              Novembre
            </option>

            <option value="12">
              Décembre
            </option>
          </select>

          {/* ANNÉE */}

          <select
            value={yearFilter}
            onChange={(event) =>
              setYearFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
              Toutes les années
            </option>

            {availableYears.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>

          {/* RESET */}

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {filteredReservations.length}{" "}
          réservation(s) affichée(s) sur{" "}
          {reservations.length}.
        </div>
      </div>

      {/* =====================================================
          ERREUR
      ====================================================== */}

      {error && (
        <div className="border-b border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          TABLEAU
      ====================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead className="bg-slate-950">
            <tr className="border-b border-slate-800">
              <th className="px-5 py-3 text-slate-400">
                N°
              </th>

              <th className="px-5 py-3 text-slate-400">
                Référence
              </th>

              <th className="px-5 py-3 text-slate-400">
                Titre
              </th>

              <th className="px-5 py-3 text-slate-400">
                Client
              </th>

              <th className="px-5 py-3 text-slate-400">
                Date
              </th>

              <th className="px-5 py-3 text-slate-400">
                Statut
              </th>

              <th className="px-5 py-3 text-slate-400">
                Paiement
              </th>

              <th className="px-5 py-3 text-slate-400">
                Montant
              </th>

              <th className="px-5 py-3 text-center text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredReservations.map(
              (reservation, index) => {
                const montant = Number(
                  reservation.montant || 0
                );

                const montantPaye = Number(
                  reservation.montantPaye || 0
                );

                const resteAPayer =
                  Math.max(
                    0,
                    Number(
                      reservation.resteAPayer ??
                        montant -
                          montantPaye
                    )
                  );

                const clientName =
                  getClientName(
                    reservation
                  );

                const clientPhone =
                  getClientPhone(
                    reservation
                  );

                const clientAddress =
                  getClientAddress(
                    reservation
                  );

                const title =
                  getReservationTitle(
                    reservation
                  );

                const reservationDate =
                  normalizeDate(
                    getReservationDate(
                      reservation
                    )
                  );

                const whatsappUrl =
                  getWhatsAppUrl(
                    clientPhone
                  );

                const isCancelled =
                  reservation.statut ===
                  "ANNULEE";

                const isPaid =
                  resteAPayer <= 0 ||
                  reservation.paymentStatus ===
                    "PAYE";

                const isPaymentOpen =
                  paymentReservationId ===
                  reservation.id;

                const isProcessing =
                  processingPayment ===
                  reservation.id;

                const isCancelling =
                  cancellingReservation ===
                  reservation.id;

                const isDeleting =
                  processingDelete ===
                  reservation.id;

                const isMenuOpen =
                  openActionMenu ===
                  reservation.id;

                const paymentStatus =
                  reservation.paymentStatus ||
                  "NON_PAYE";

                return (
                  <tr
                    key={reservation.id}
                    className="border-b border-slate-800 align-top transition hover:bg-slate-800/50"
                  >
                    {/* N° */}

                    <td className="px-5 py-4 font-bold text-slate-500">
                      {index + 1}
                    </td>

                    {/* RÉFÉRENCE */}

                    <td className="px-5 py-4 font-semibold text-white">
                      {reservation.reference}
                    </td>

                    {/* TITRE */}

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">
                        {title}
                      </div>
                    </td>

                    {/* CLIENT */}

                    <td className="px-5 py-4">
                      <div className="min-w-[240px]">
                        <div className="font-semibold text-white">
                          {clientName}
                        </div>

                        {clientPhone ? (
                          <a
                            href={
                              whatsappUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block text-sm font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                            title="Discuter avec le client sur WhatsApp"
                          >
                            {clientPhone}
                          </a>
                        ) : (
                          <div className="mt-1 text-xs text-slate-500">
                            Téléphone non renseigné
                          </div>
                        )}

                        {clientAddress && (
                          <div className="mt-1 text-xs leading-5 text-slate-400">
                            {clientAddress}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4 text-slate-300">
                      {reservationDate ||
                        getReservationDate(
                          reservation
                        ) ||
                        "—"}
                    </td>

                    {/* STATUT */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          reservation.statut
                        )}`}
                      >
                        {STATUS_LABELS[
                          reservation.statut
                        ] ||
                          reservation.statut}
                      </span>
                    </td>

                    {/* PAIEMENT */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClass(
                          paymentStatus
                        )}`}
                      >
                        {getPaymentStatusLabel(
                          paymentStatus
                        )}
                      </span>
                    </td>

                    {/* MONTANT */}

                    <td className="px-5 py-4">
                      <div className="min-w-[150px] space-y-1">
                        <div className="font-semibold text-white">
                          Total :{" "}
                          {montant.toLocaleString(
                            "fr-FR"
                          )}{" "}
                          $
                        </div>

                        <div className="text-xs text-emerald-400">
                          Payé :{" "}
                          {montantPaye.toLocaleString(
                            "fr-FR"
                          )}{" "}
                          $
                        </div>

                        <div
                          className={`text-sm font-bold ${
                            resteAPayer > 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          Reste :{" "}
                          {resteAPayer.toLocaleString(
                            "fr-FR"
                          )}{" "}
                          $
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="relative flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionMenu(
                              isMenuOpen
                                ? null
                                : reservation.id
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                          title="Afficher les actions"
                          aria-label="Afficher les actions"
                        >
                          <EllipsisVertical className="h-5 w-5" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                            {/* PAYER */}

                            {!isCancelled &&
                              !isPaid && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    isPaymentOpen
                                      ? closePayment()
                                      : openPayment(
                                          reservation
                                        )
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-emerald-300 hover:bg-emerald-950/50"
                                >
                                  <CheckCircle2 className="h-4 w-4" />

                                  {isPaymentOpen
                                    ? "Fermer paiement"
                                    : "Payer"}
                                </button>
                              )}

                            {/* MODIFIER */}

                            <Link
                              href={`/reservations/${reservation.id}/modifier`}
                              onClick={() =>
                                setOpenActionMenu(
                                  null
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-950/50"
                            >
                              <Edit className="h-4 w-4" />

                              Modifier
                            </Link>

                            {/* ANNULER */}

                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCancel(
                                    reservation
                                  )
                                }
                                disabled={
                                  isCancelling
                                }
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-amber-300 hover:bg-amber-950/50 disabled:opacity-50"
                              >
                                {isCancelling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}

                                Annuler
                              </button>
                            )}

                            {/* SUPPRIMER */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  reservation
                                )
                              }
                              disabled={
                                isDeleting
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-300 hover:bg-red-950/50 disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>

                      {/* =================================================
                          FORMULAIRE PAIEMENT
                      ================================================== */}

                      {!isCancelled &&
                        !isPaid &&
                        isPaymentOpen && (
                          <div className="mt-3 w-64 space-y-2 rounded-lg border border-slate-700 bg-slate-950 p-3">
                            <select
                              value={
                                paymentMethod
                              }
                              onChange={(
                                event
                              ) =>
                                setPaymentMethod(
                                  event.target
                                    .value as PaymentMethod
                                )
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                            >
                              {PAYMENT_METHODS.map(
                                (method) => (
                                  <option
                                    key={
                                      method.value
                                    }
                                    value={
                                      method.value
                                    }
                                  >
                                    {
                                      method.label
                                    }
                                  </option>
                                )
                              )}
                            </select>

                            <input
                              type="number"
                              min="0.01"
                              max={
                                resteAPayer
                              }
                              step="0.01"
                              value={
                                paymentAmount
                              }
                              onChange={(
                                event
                              ) =>
                                setPaymentAmount(
                                  event.target
                                    .value
                                )
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                              placeholder="Montant"
                            />

                            <div className="text-xs text-slate-400">
                              Reste maximum :{" "}
                              {resteAPayer.toLocaleString(
                                "fr-FR"
                              )}{" "}
                              $
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handlePayment(
                                  reservation
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}

                              Valider paiement
                            </button>

                            <button
                              type="button"
                              onClick={
                                closePayment
                              }
                              className="w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                            >
                              Fermer
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          AUCUN RÉSULTAT
      ====================================================== */}

      {filteredReservations.length === 0 && (
        <div className="p-10 text-center">
          <p className="text-slate-400">
            Aucune réservation trouvée.
          </p>
        </div>
      )}
    </div>
  );
}
