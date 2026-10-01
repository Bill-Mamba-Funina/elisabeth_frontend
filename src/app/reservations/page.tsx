"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import ReservationTable from "@/components/reservations/ReservationTable";

// ============================================================
// CLIENT API
// ============================================================

interface ApiClient {
  id?: number;
  full_name?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// ============================================================
// RESERVATION API
// ============================================================

interface ApiReservation {
  id: number;

  reservation_number?: string;
  reference?: string;

  client?: number | ApiClient;

  client_name?: string;

  client_full_name?: string;

  client_phone?: string;
  client_phone_display?: string;

  client_email?: string;
  client_email_display?: string;

  client_address?: string;
  client_address_display?: string;

  client_data?: ApiClient;

  hall?: number | {
    id: number;
    name?: string;
  };

  hall_name?: string;

  event_type?: string;

  title?: string;
  titre?: string;

  event_date?: string;
  reservation_date?: string;

  start_time?: string;
  end_time?: string;

  guest_count?: number;

  total_amount?: number | string;
  paid_amount?: number | string;
  remaining_amount?: number | string;

  payment_status?:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE"
    | "REMBOURSE";

  status?:
    | "EN_ATTENTE"
    | "CONFIRMEE"
    | "EN_COURS"
    | "TERMINEE"
    | "CLOTUREE"
    | "ANNULEE";
}

// ============================================================
// RESERVATION FRONTEND
// ============================================================

export interface Reservation {
  id: number;

  reference: string;

  client: string;

  client_name?: string;

  client_full_name?: string;

  client_phone?: string;
  client_phone_display?: string;

  client_email?: string;
  client_email_display?: string;

  client_address?: string;
  client_address_display?: string;

  client_data?: ApiClient;

  event_date?: string;

  date: string;

  titre?: string;
  title?: string;
  event_type?: string;

  statut: string;

  montant: number;
  montantPaye: number;
  resteAPayer: number;

  total_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;

  paymentStatus:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE"
    | "REMBOURSE";

  payment_status?:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE"
    | "REMBOURSE";
}

// ============================================================
// EXTRACTION NOM CLIENT
// ============================================================

function extractClientName(
  reservation: ApiReservation
): string {
  if (reservation.client_name?.trim()) {
    return reservation.client_name.trim();
  }

  if (reservation.client_full_name?.trim()) {
    return reservation.client_full_name.trim();
  }

  if (reservation.client_data?.full_name?.trim()) {
    return reservation.client_data.full_name.trim();
  }

  if (
    typeof reservation.client === "object" &&
    reservation.client !== null
  ) {
    return (
      reservation.client.full_name?.trim() ||
      reservation.client.name?.trim() ||
      "Client inconnu"
    );
  }

  return "Client inconnu";
}

// ============================================================
// EXTRACTION TELEPHONE
// ============================================================

function extractClientPhone(
  reservation: ApiReservation
): string {
  // Priorité au champ renvoyé par ReservationSerializer
  if (reservation.client_phone_display?.trim()) {
    return reservation.client_phone_display.trim();
  }

  if (reservation.client_phone?.trim()) {
    return reservation.client_phone.trim();
  }

  if (reservation.client_data?.phone?.trim()) {
    return reservation.client_data.phone.trim();
  }

  if (
    typeof reservation.client === "object" &&
    reservation.client !== null &&
    reservation.client.phone?.trim()
  ) {
    return reservation.client.phone.trim();
  }

  return "";
}

// ============================================================
// EXTRACTION EMAIL
// ============================================================

function extractClientEmail(
  reservation: ApiReservation
): string {
  if (reservation.client_email_display?.trim()) {
    return reservation.client_email_display.trim();
  }

  if (reservation.client_email?.trim()) {
    return reservation.client_email.trim();
  }

  if (reservation.client_data?.email?.trim()) {
    return reservation.client_data.email.trim();
  }

  if (
    typeof reservation.client === "object" &&
    reservation.client !== null &&
    reservation.client.email?.trim()
  ) {
    return reservation.client.email.trim();
  }

  return "";
}

// ============================================================
// EXTRACTION ADRESSE
// ============================================================

function extractClientAddress(
  reservation: ApiReservation
): string {
  // Priorité au champ renvoyé par ReservationSerializer
  if (reservation.client_address_display?.trim()) {
    return reservation.client_address_display.trim();
  }

  if (reservation.client_address?.trim()) {
    return reservation.client_address.trim();
  }

  if (reservation.client_data?.address?.trim()) {
    return reservation.client_data.address.trim();
  }

  if (
    typeof reservation.client === "object" &&
    reservation.client !== null &&
    reservation.client.address?.trim()
  ) {
    return reservation.client.address.trim();
  }

  return "";
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
  value?: string
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR");
}

// ============================================================
// NORMALISATION RESERVATION
// ============================================================

function normalizeReservation(
  reservation: ApiReservation
): Reservation {
  const total = Number(
    reservation.total_amount ?? 0
  );

  const paid = Number(
    reservation.paid_amount ?? 0
  );

  const remaining = Math.max(
    0,
    Number(
      reservation.remaining_amount ??
        total - paid
    )
  );

  let paymentStatus =
    reservation.payment_status;

  if (!paymentStatus) {
    if (remaining <= 0 && total > 0) {
      paymentStatus = "PAYE";
    } else if (paid > 0) {
      paymentStatus = "PARTIEL";
    } else {
      paymentStatus = "NON_PAYE";
    }
  }

  const clientName =
    extractClientName(reservation);

  const clientPhone =
    extractClientPhone(reservation);

  const clientEmail =
    extractClientEmail(reservation);

  const clientAddress =
    extractClientAddress(reservation);

  const eventType =
    reservation.event_type ||
    reservation.title ||
    reservation.titre ||
    "Réservation";

  const eventDate =
    reservation.event_date ||
    reservation.reservation_date ||
    "";

  return {
    id: reservation.id,

    reference:
      reservation.reservation_number ||
      reservation.reference ||
      `RES-${reservation.id}`,

    client: clientName,

    client_name: clientName,

    client_full_name: clientName,

    // Téléphone
    client_phone: clientPhone,
    client_phone_display: clientPhone,

    // Email
    client_email: clientEmail,
    client_email_display: clientEmail,

    // Adresse
    client_address: clientAddress,
    client_address_display: clientAddress,

    client_data:
      typeof reservation.client === "object"
        ? reservation.client
        : undefined,

    event_date: eventDate,

    date: formatDate(eventDate),

    titre: eventType,

    title: eventType,

    event_type:
      reservation.event_type,

    statut:
      reservation.status ||
      "EN_ATTENTE",

    montant: total,

    montantPaye: paid,

    resteAPayer: remaining,

    total_amount: total,

    paid_amount: paid,

    remaining_amount: remaining,

    paymentStatus,

    payment_status: paymentStatus,
  };
}

// ============================================================
// PAGE
// ============================================================

export default function ReservationsPage() {
  const [
    reservations,
    setReservations,
  ] = useState<Reservation[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // CHARGEMENT RESERVATIONS
  // ==========================================================

  const loadReservations = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const url =
          `${API_ROUTES.RESERVATIONS}?page_size=1000`;

        console.log(
          "[reservations] GET:",
          url
        );

        const response =
          await api.get(url);

        console.log(
          "[reservations] réponse:",
          response.data
        );

        const data =
          response.data;

        const rows: ApiReservation[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : [];

        setReservations(
          rows.map(
            normalizeReservation
          )
        );

      } catch (err: unknown) {

        console.error(
          "[reservations] Erreur chargement :",
          err
        );

        const axiosError =
          err as {
            message?: string;
            code?: string;
            response?: {
              status?: number;
              data?: unknown;
            };
          };

        console.error(
          "[reservations] message:",
          axiosError.message
        );

        console.error(
          "[reservations] code:",
          axiosError.code
        );

        console.error(
          "[reservations] status:",
          axiosError.response?.status
        );

        console.error(
          "[reservations] data:",
          axiosError.response?.data
        );

        setError(
          "Impossible de charger les réservations."
        );

      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const stats = useMemo(() => {

    const total =
      reservations.length;

    const confirmed =
      reservations.filter(
        (item) =>
          item.statut ===
          "CONFIRMEE"
      ).length;

    const pending =
      reservations.filter(
        (item) =>
          item.statut ===
          "EN_ATTENTE"
      ).length;

    const cancelled =
      reservations.filter(
        (item) =>
          item.statut ===
          "ANNULEE"
      ).length;

    const paid =
      reservations.filter(
        (item) =>
          item.paymentStatus ===
          "PAYE"
      ).length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      paid,
    };

  }, [reservations]);

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <section className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-white">
            Réservations
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Gestion des réservations de la salle.
          </p>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => {
              void loadReservations();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
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

          <Link
            href="/reservations/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >

            <Plus className="h-4 w-4" />

            Nouvelle réservation

          </Link>

        </div>

      </div>

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <StatCard
          label="Total"
          value={stats.total}
        />

        <StatCard
          label="Confirmées"
          value={stats.confirmed}
        />

        <StatCard
          label="En attente"
          value={stats.pending}
        />

        <StatCard
          label="Payées"
          value={stats.paid}
        />

        <StatCard
          label="Annulées"
          value={stats.cancelled}
        />

      </div>

      {/* =====================================================
          ERREUR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          CHARGEMENT
      ====================================================== */}

      {loading ? (

        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900">

          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />

          <span className="ml-3 text-slate-400">
            Chargement des réservations...
          </span>

        </div>

      ) : (

        <ReservationTable
          reservations={reservations}
          onRefresh={loadReservations}
        />

      )}

    </section>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

