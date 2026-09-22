"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import {
  CalendarDays,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";

type Reservation = {
  id: number | string;
  reservation_number?: string;

  event_date?: string;
  start_time?: string;
  end_time?: string;

  event_type?: string;

  status?: string;

  total_amount?: number | string;
  paid_amount?: number | string;
  remaining_amount?: number | string;

  client?: {
    id?: number;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };

  hall?: {
    id?: number;
    name?: string;
  };
};

export default function ReservationsClientPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          API_ROUTES.RESERVATIONS
        );

        const data = response.data;

        if (Array.isArray(data)) {
          setReservations(data);
        } else if (Array.isArray(data?.results)) {
          setReservations(data.results);
        } else {
          setReservations([]);
        }
      } catch (err: any) {
        console.error(
          "Erreur chargement des réservations :",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Impossible de charger les réservations."
        );

        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  /**
   * ==========================================================
   * FORMATAGE DATE
   * ==========================================================
   */
  const formatDate = (date?: string) => {
    if (!date) return "Date non définie";

    const value = String(date).substring(0, 10);

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  };

  /**
   * ==========================================================
   * CLIENT
   * ==========================================================
   */
  const getClientName = (reservation: Reservation) => {
    const client = reservation.client;

    if (!client) {
      return "Client non renseigné";
    }

    if (client.full_name) {
      return client.full_name;
    }

    const fullName = [
      client.first_name,
      client.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || "Client non renseigné";
  };

  /**
   * ==========================================================
   * SALLE
   * ==========================================================
   */
  const getHallName = (reservation: Reservation) => {
    return (
      reservation.hall?.name ||
      "Salle non renseignée"
    );
  };

  /**
   * ==========================================================
   * STATUT
   * ==========================================================
   */
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "CONFIRMEE":
        return "Confirmée";

      case "ANNULEE":
        return "Annulée";

      case "EVENT_TERMINE":
        return "Événement terminé";

      case "CLOTUREE":
        return "Clôturée";

      case "EN_ATTENTE":
        return "En attente";

      default:
        return status || "En attente";
    }
  };

  /**
   * ==========================================================
   * COULEUR STATUT
   * ==========================================================
   */
  const getStatusClass = (status?: string) => {
    switch (status) {
      case "CONFIRMEE":
        return "bg-green-100 text-green-700";

      case "ANNULEE":
        return "bg-red-100 text-red-700";

      case "EVENT_TERMINE":
      case "CLOTUREE":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  /**
   * ==========================================================
   * MONTANT
   * ==========================================================
   */
  const formatAmount = (amount?: number | string) => {
    return Number(amount || 0).toLocaleString("fr-FR");
  };

  return (
    <section className="space-y-6">

      {/* ======================================================
          EN-TÊTE
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Mes réservations
          </h1>

          <p className="mt-1 text-gray-500">
            Consultez vos réservations de salles et leurs
            informations financières.
          </p>
        </div>

        <Link
          href="/reservations/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle réservation
        </Link>

      </div>

      {/* ======================================================
          ERREUR
      ====================================================== */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>{error}</span>

        </div>
      )}

      {/* ======================================================
          CHARGEMENT
      ====================================================== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-12">

          <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Chargement des réservations...
          </p>

        </div>
      ) : reservations.length === 0 ? (

        /* ====================================================
           AUCUNE RÉSERVATION
        ==================================================== */
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-12 text-center">

          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <CalendarDays className="h-8 w-8 text-gray-400" />
          </div>

          <h2 className="font-semibold text-gray-700">
            Aucune réservation
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Aucune réservation n'a encore été enregistrée.
          </p>

          <Link
            href="/reservations/nouveau"
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Créer une réservation
          </Link>

        </div>
      ) : (

        /* ====================================================
           LISTE DES RÉSERVATIONS
        ==================================================== */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {reservations.map((reservation) => (

            <article
              key={reservation.id}
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              {/* ------------------------------------------------
                  RÉFÉRENCE + STATUT
              ------------------------------------------------ */}
              <div className="flex items-start justify-between gap-3">

                <div>
                  <p className="text-xs text-gray-400">
                    Réservation
                  </p>

                  <p className="font-mono text-sm font-bold text-gray-700">
                    {reservation.reservation_number ||
                      `RES-${reservation.id}`}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    reservation.status
                  )}`}
                >
                  {getStatusLabel(reservation.status)}
                </span>

              </div>

              {/* ------------------------------------------------
                  CLIENT
              ------------------------------------------------ */}
              <div className="mt-4">

                <p className="text-xs text-gray-400">
                  Client
                </p>

                <p className="font-semibold text-gray-800">
                  {getClientName(reservation)}
                </p>

              </div>

              {/* ------------------------------------------------
                  ÉVÉNEMENT
              ------------------------------------------------ */}
              <div className="mt-3">

                <p className="text-xs text-gray-400">
                  Événement
                </p>

                <p className="font-medium text-indigo-600">
                  {reservation.event_type ||
                    "Événement non renseigné"}
                </p>

              </div>

              {/* ------------------------------------------------
                  SALLE
              ------------------------------------------------ */}
              <div className="mt-3">

                <p className="text-xs text-gray-400">
                  Salle
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {getHallName(reservation)}
                </p>

              </div>

              {/* ------------------------------------------------
                  DATE + HORAIRE
              ------------------------------------------------ */}
              <div className="mt-3">

                <p className="text-xs text-gray-400">
                  Date et horaire
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {formatDate(reservation.event_date)}
                </p>

                <p className="text-xs text-gray-500">
                  {reservation.start_time || "--:--"}
                  {" - "}
                  {reservation.end_time || "--:--"}
                </p>

              </div>

              {/* ------------------------------------------------
                  FINANCES
              ------------------------------------------------ */}
              <div className="mt-4 border-t pt-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Montant total
                  </span>

                  <span className="font-bold text-gray-800">
                    {formatAmount(
                      reservation.total_amount
                    )}{" "}
                    $
                  </span>

                </div>

                <div className="mt-1 flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Déjà payé
                  </span>

                  <span className="text-sm font-semibold text-green-600">
                    {formatAmount(
                      reservation.paid_amount
                    )}{" "}
                    $
                  </span>

                </div>

                <div className="mt-1 flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Reste à payer
                  </span>

                  <span className="text-sm font-semibold text-red-600">
                    {formatAmount(
                      reservation.remaining_amount
                    )}{" "}
                    $
                  </span>

                </div>

              </div>

              {/* ------------------------------------------------
                  ACTION
              ------------------------------------------------ */}
              <div className="mt-5">

                <Link
                  href={`/reservations/${reservation.id}`}
                  className="block w-full rounded-lg border border-blue-600 px-4 py-2 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                >
                  Voir la réservation
                </Link>

              </div>

            </article>

          ))}

        </div>
      )}

    </section>
  );
}