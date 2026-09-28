"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, RefreshCw } from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import ReservationTable from "@/components/reservations/ReservationTable";

interface ApiReservation {
  id: number;
  reservation_number?: string;
  reference?: string;

  client?: number | { id: number; full_name?: string };
  client_name?: string;
  client_full_name?: string;

  hall?: number | { id: number; name?: string };
  hall_name?: string;

  event_type?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;

  total_amount?: number | string;
  paid_amount?: number | string;
  remaining_amount?: number | string;

  payment_status?: "NON_PAYE" | "PARTIEL" | "PAYE";

  status?:
    | "EN_ATTENTE"
    | "CONFIRMEE"
    | "EN_COURS"
    | "TERMINEE"
    | "CLOTUREE"
    | "ANNULEE";
}

interface Reservation {
  id: number;
  reference: string;
  client: string;
  salle: string;
  date: string;
  statut: string;

  montant: number | string;
  montantPaye: number | string;
  resteAPayer: number | string;

  paymentStatus: "NON_PAYE" | "PARTIEL" | "PAYE";
}

function extractName(
  value:
    | string
    | number
    | { id: number; full_name?: string; name?: string }
    | undefined,
  fallback: string
): string {
  if (typeof value === "object" && value !== null) {
    return value.full_name || value.name || fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  return fallback;
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR");
}

function normalizeReservation(
  reservation: ApiReservation
): Reservation {
  const total = Number(reservation.total_amount || 0);
  const paid = Number(reservation.paid_amount || 0);

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

  return {
    id: reservation.id,

    reference:
      reservation.reservation_number ||
      reservation.reference ||
      `RES-${reservation.id}`,

    client:
      reservation.client_name ||
      reservation.client_full_name ||
      extractName(
        reservation.client,
        "Client inconnu"
      ),

    salle:
      reservation.hall_name ||
      extractName(
        reservation.hall,
        "Salle inconnue"
      ),

    date: formatDate(
      reservation.event_date
    ),

    statut:
      reservation.status ||
      "EN_ATTENTE",

    montant: total,
    montantPaye: paid,
    resteAPayer: remaining,

    paymentStatus,
  };
}

export default function ReservationsPage() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadReservations = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `${API_ROUTES.RESERVATIONS}?page_size=1000`
        );

        const data = response.data;

        const rows: ApiReservation[] =
          Array.isArray(data)
            ? data
            : data?.results ?? [];

        setReservations(
          rows.map(normalizeReservation)
        );
      } catch (err: unknown) {
        console.error(
          "Erreur chargement réservations :",
          err
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

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const stats = useMemo(() => {
    const total = reservations.length;

    const confirmed =
      reservations.filter(
        (item) =>
          item.statut === "CONFIRMEE"
      ).length;

    const pending =
      reservations.filter(
        (item) =>
          item.statut === "EN_ATTENTE"
      ).length;

    const cancelled =
      reservations.filter(
        (item) =>
          item.statut === "ANNULEE"
      ).length;

    const paid =
      reservations.filter(
        (item) =>
          item.paymentStatus === "PAYE"
      ).length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      paid,
    };
  }, [reservations]);

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
            onClick={loadReservations}
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

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

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

