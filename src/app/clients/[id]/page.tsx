"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Filter,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Client {
  id: number | string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  reservations_count?: number;
}

interface Reservation {
  id: number | string;
  reservation_number?: string;
  event_type?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  hall?: {
    id?: number | string;
    name?: string;
  };
  total_amount?: number | string;
  paid_amount?: number | string;
  refunded_amount?: number | string;
  net_paid_amount?: number | string;
  remaining_amount?: number | string;
  payment_status?: string;
  status?: string;
}

interface Payment {
  id: number | string;
  amount?: number | string;
  payment_date?: string;
  method?: string;
  reference?: string | null;
  status?: string;
  reservation?:
    | {
        id?: number | string;
        reservation_number?: string;
      }
    | number
    | string
    | null;
}

type ReservationDateFilter =
  | "ALL"
  | "UPCOMING"
  | "PAST";

function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data
  ) {
    const results = (data as { results?: unknown }).results;

    if (Array.isArray(results)) {
      return results as T[];
    }
  }

  return [];
}

function formatMoney(
  value: number | string | undefined,
): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function getWhatsAppUrl(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");

  return `https://wa.me/${cleanPhone}`;
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      }
    ).response;

    if (response?.status === 404) {
      return "La ressource demandée est introuvable. Vérifiez les routes API Django.";
    }

    const data = response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data && typeof data === "object") {
      const objectData = data as Record<string, unknown>;

      if (typeof objectData.detail === "string") {
        return objectData.detail;
      }

      if (typeof objectData.message === "string") {
        return objectData.message;
      }

      const messages = Object.entries(objectData)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(", ")}`;
          }

          return `${key}: ${String(value)}`;
        })
        .join("\n");

      if (messages) {
        return messages;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Impossible de charger l'historique du client.";
}

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>();

  const clientId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [client, setClient] =
    useState<Client | null>(null);

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reservationSearch, setReservationSearch] =
    useState("");

  const [reservationStatus, setReservationStatus] =
    useState("ALL");

  const [reservationDateFilter, setReservationDateFilter] =
    useState<ReservationDateFilter>("ALL");

  const [paymentSearch, setPaymentSearch] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("ALL");

  const [paymentStatus, setPaymentStatus] =
    useState("ALL");

  async function loadClientHistory() {
    if (!clientId) {
      setError("Identifiant du client introuvable.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      /* CLIENT */
      const clientsBaseUrl =
        API_ROUTES.CLIENTS.replace(/\/+$/, "");

      const clientUrl =
        `${clientsBaseUrl}/${encodeURIComponent(clientId)}/`;

      console.log("[CLIENT] GET", clientUrl);

      const clientResponse =
        await api.get(clientUrl);

      setClient(clientResponse.data);

      /* RESERVATIONS */
      const reservationsBaseUrl =
        API_ROUTES.RESERVATIONS.replace(/\/+$/, "");

      const reservationsResponse =
        await api.get(
          `${reservationsBaseUrl}/?client=${encodeURIComponent(
            clientId,
          )}&page_size=100`,
        );

      const reservationsList =
        extractList<Reservation>(
          reservationsResponse.data,
        );

      setReservations(reservationsList);

      /* PAIEMENTS */
      const paymentsBaseUrl =
        API_ROUTES.PAYMENTS.replace(/\/+$/, "");

      const paymentResponses =
        await Promise.all(
          reservationsList.map(
            async (reservation) => {
              try {
                const response =
                  await api.get(
                    `${paymentsBaseUrl}/?reservation=${encodeURIComponent(
                      String(reservation.id),
                    )}&page_size=100`,
                  );

                return extractList<Payment>(
                  response.data,
                );
              } catch (paymentError) {
                console.error(
                  `[CLIENT] Erreur paiement réservation ${reservation.id}:`,
                  paymentError,
                );

                return [];
              }
            },
          ),
        );

      setPayments(paymentResponses.flat());
    } catch (error: unknown) {
      console.error(
        "[CLIENT HISTORY ERROR]",
        error,
      );

      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClientHistory();
  }, [clientId]);

  const filteredReservations = useMemo(() => {
    const search = reservationSearch
      .trim()
      .toLowerCase();

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return reservations.filter((reservation) => {
      const matchesSearch =
        !search ||
        (
          reservation.reservation_number ?? ""
        )
          .toLowerCase()
          .includes(search) ||
        (
          reservation.event_type ?? ""
        )
          .toLowerCase()
          .includes(search) ||
        (
          reservation.hall?.name ?? ""
        )
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        reservationStatus === "ALL" ||
        reservation.status === reservationStatus;

      let matchesDate = true;

      if (reservationDateFilter !== "ALL") {
        if (!reservation.event_date) {
          matchesDate = false;
        } else {
          const reservationDate =
            new Date(reservation.event_date);

          reservationDate.setHours(0, 0, 0, 0);

          if (
            reservationDateFilter ===
            "UPCOMING"
          ) {
            matchesDate =
              reservationDate >= today;
          }

          if (
            reservationDateFilter === "PAST"
          ) {
            matchesDate =
              reservationDate < today;
          }
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    reservations,
    reservationSearch,
    reservationStatus,
    reservationDateFilter,
  ]);

  const filteredPayments = useMemo(() => {
    const search = paymentSearch
      .trim()
      .toLowerCase();

    return payments.filter((payment) => {
      const reservation =
        typeof payment.reservation === "object"
          ? payment.reservation
          : null;

      const reservationNumber =
        reservation?.reservation_number ||
        (
          typeof payment.reservation === "number" ||
          typeof payment.reservation === "string"
            ? `#${payment.reservation}`
            : ""
        );

      const matchesSearch =
        !search ||
        reservationNumber
          .toLowerCase()
          .includes(search) ||
        (payment.reference ?? "")
          .toLowerCase()
          .includes(search);

      const matchesMethod =
        paymentMethod === "ALL" ||
        payment.method === paymentMethod;

      const matchesStatus =
        paymentStatus === "ALL" ||
        payment.status === paymentStatus;

      return (
        matchesSearch &&
        matchesMethod &&
        matchesStatus
      );
    });
  }, [
    payments,
    paymentSearch,
    paymentMethod,
    paymentStatus,
  ]);

  const totalReservations =
    reservations.length;

  const totalPayments = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount ?? 0),
    0,
  );

  const filteredPaymentsTotal =
    filteredPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount ?? 0),
      0,
    );

  const hasReservationFilters =
    reservationSearch.trim() !== "" ||
    reservationStatus !== "ALL" ||
    reservationDateFilter !== "ALL";

  const hasPaymentFilters =
    paymentSearch.trim() !== "" ||
    paymentMethod !== "ALL" ||
    paymentStatus !== "ALL";

  function resetReservationFilters() {
    setReservationSearch("");
    setReservationStatus("ALL");
    setReservationDateFilter("ALL");
  }

  function resetPaymentFilters() {
    setPaymentSearch("");
    setPaymentMethod("ALL");
    setPaymentStatus("ALL");
  }

  return (
    <section className="min-h-screen space-y-6 bg-slate-950 p-6 text-slate-100">
      {/* RETOUR */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux clients
        </Link>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="whitespace-pre-line rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* CHARGEMENT */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-16 text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          Chargement de l'historique...
        </div>
      ) : !client ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
          <p className="text-slate-300">
            Client introuvable.
          </p>
        </div>
      ) : (
        <>
          {/* INFORMATIONS CLIENT */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Client
                </p>

                <h1 className="mt-1 text-2xl font-bold text-white">
                  {client.full_name}
                </h1>

                <div className="mt-4 space-y-2 text-sm">
                  {client.phone && (
                    <a
                      href={getWhatsAppUrl(
                        client.phone,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-400 transition hover:text-green-300"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {client.phone}
                    </a>
                  )}

                  {client.email && (
                    <p className="text-slate-400">
                      {client.email}
                    </p>
                  )}

                  {client.address && (
                    <p className="text-slate-400">
                      {client.address}
                    </p>
                  )}

                  {client.notes && (
                    <p className="text-slate-500">
                      {client.notes}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadClientHistory()
                }
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Actualiser
              </button>
            </div>
          </div>

          {/* STATISTIQUES */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-blue-400" />

                <div>
                  <p className="text-sm text-slate-400">
                    Réservations
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {totalReservations}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-green-400" />

                <div>
                  <p className="text-sm text-slate-400">
                    Paiements
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatMoney(totalPayments)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Téléphone
              </p>

              <p className="mt-1 font-semibold text-white">
                {client.phone || "-"}
              </p>
            </div>
          </div>

          {/* RESERVATIONS */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Historique des réservations
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {filteredReservations.length} réservation
                    {filteredReservations.length > 1
                      ? "s"
                      : ""}{" "}
                    affichée
                    {filteredReservations.length > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Filter className="h-4 w-4" />
                  Filtres
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={reservationSearch}
                    onChange={(event) =>
                      setReservationSearch(
                        event.target.value,
                      )
                    }
                    placeholder="N°, événement ou salle..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-9 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                  />

                  {reservationSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setReservationSearch("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <select
                  value={reservationStatus}
                  onChange={(event) =>
                    setReservationStatus(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="ALL">
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

                <select
                  value={reservationDateFilter}
                  onChange={(event) =>
                    setReservationDateFilter(
                      event.target.value as ReservationDateFilter,
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="ALL">
                    Toutes les dates
                  </option>
                  <option value="UPCOMING">
                    À venir
                  </option>
                  <option value="PAST">
                    Passées
                  </option>
                </select>

                {hasReservationFilters && (
                  <button
                    type="button"
                    onClick={
                      resetReservationFilters
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {reservations.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucune réservation pour ce client.
              </div>
            ) : filteredReservations.length ===
              0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucune réservation ne correspond
                aux filtres.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-800">
                    <tr>
                      <th className="px-5 py-4 text-slate-200">
                        N°
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Réservation
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Événement
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Date
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Salle
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Total
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Payé
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Reste
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Statut
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReservations.map(
                      (reservation, index) => (
                        <tr
                          key={reservation.id}
                          className="border-b border-slate-800 transition hover:bg-slate-800/50"
                        >
                          <td className="px-5 py-4 text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4 font-medium text-white">
                            {reservation.reservation_number ||
                              `#${reservation.id}`}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {reservation.event_type ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {formatDate(
                              reservation.event_date,
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {reservation.hall?.name ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {formatMoney(
                              reservation.total_amount,
                            )}
                          </td>

                          <td className="px-5 py-4 text-green-400">
                            {formatMoney(
                              reservation.net_paid_amount ??
                                reservation.paid_amount,
                            )}
                          </td>

                          <td className="px-5 py-4 text-orange-400">
                            {formatMoney(
                              reservation.remaining_amount,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                              {reservation.status ||
                                "-"}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAIEMENTS */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Historique des paiements
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {filteredPayments.length} paiement
                    {filteredPayments.length > 1
                      ? "s"
                      : ""}{" "}
                    affiché
                    {filteredPayments.length > 1
                      ? "s"
                      : ""}{" "}
                    •{" "}
                    {formatMoney(
                      filteredPaymentsTotal,
                    )}
                  </p>
                </div>

                <div className="text-sm text-slate-500">
                  Total général :{" "}
                  <span className="font-semibold text-white">
                    {formatMoney(totalPayments)}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(event) =>
                      setPaymentSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Réservation ou référence..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-9 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                  />

                  {paymentSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentSearch("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="ALL">
                    Toutes les méthodes
                  </option>
                  <option value="ESPECES">
                    Espèces
                  </option>
                  <option value="VIREMENT">
                    Virement
                  </option>
                  <option value="MOBILE_MONEY">
                    Mobile Money
                  </option>
                </select>

                <select
                  value={paymentStatus}
                  onChange={(event) =>
                    setPaymentStatus(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="ALL">
                    Tous les statuts
                  </option>
                  <option value="EN_ATTENTE">
                    En attente
                  </option>
                  <option value="VALIDE">
                    Validé
                  </option>
                  <option value="ANNULE">
                    Annulé
                  </option>
                </select>

                {hasPaymentFilters && (
                  <button
                    type="button"
                    onClick={resetPaymentFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucun paiement enregistré pour ce
                client.
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucun paiement ne correspond aux
                filtres.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-800">
                    <tr>
                      <th className="px-5 py-4 text-slate-200">
                        N°
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Date
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Réservation
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Montant
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Méthode
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Référence
                      </th>
                      <th className="px-5 py-4 text-slate-200">
                        Statut
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.map(
                      (payment, index) => {
                        const reservation =
                          typeof payment.reservation ===
                          "object"
                            ? payment.reservation
                            : null;

                        const reservationNumber =
                          reservation?.reservation_number ||
                          (
                            typeof payment.reservation ===
                              "number" ||
                            typeof payment.reservation ===
                              "string"
                              ? `#${payment.reservation}`
                              : "-"
                          );

                        return (
                          <tr
                            key={payment.id}
                            className="border-b border-slate-800 transition hover:bg-slate-800/50"
                          >
                            <td className="px-5 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4 text-slate-300">
                              {formatDate(
                                payment.payment_date,
                              )}
                            </td>

                            <td className="px-5 py-4 text-slate-300">
                              {reservationNumber}
                            </td>

                            <td className="px-5 py-4 font-semibold text-green-400">
                              {formatMoney(
                                payment.amount,
                              )}
                            </td>

                            <td className="px-5 py-4 text-slate-300">
                              {payment.method || "-"}
                            </td>

                            <td className="px-5 py-4 text-slate-400">
                              {payment.reference || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                {payment.status || "-"}
                              </span>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}