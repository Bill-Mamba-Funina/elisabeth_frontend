"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface Reservation {
  id: number | string;
  reservation_number?: string;
  event_type?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;

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

  total_amount?: number | string;
}

export default function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 1)
  );

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * IMPORTANT :
         * Il n'existe actuellement PAS de /calendar/ dans Django.
         * On utilise donc directement /reservations/.
         */
        const response = await api.get(API_ROUTES.RESERVATIONS);

        const data = response.data;

        /*
         * DRF peut retourner soit :
         * [
         *   ...
         * ]
         *
         * soit :
         * {
         *   count: ...,
         *   results: [...]
         * }
         */
        const list: Reservation[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        setReservations(list);
      } catch (err: any) {
        console.error(
          "Erreur lors du chargement des réservations :",
          err
        );

        setReservations([]);

        setError(
          err?.response?.data?.detail ||
            "Impossible de charger les réservations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  /*
   * Filtrage des réservations du mois affiché.
   */
  const events = useMemo(() => {
    return reservations.filter((reservation) => {
      if (!reservation.event_date) {
        return false;
      }

      /*
       * On évite les problèmes de fuseau horaire
       * en analysant directement YYYY-MM-DD.
       */
      const dateParts = reservation.event_date.split("-");

      if (dateParts.length < 2) {
        return false;
      }

      const reservationYear = Number(dateParts[0]);
      const reservationMonth = Number(dateParts[1]);

      return (
        reservationYear === year &&
        reservationMonth === month
      );
    });
  }, [reservations, year, month]);

  const prevMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const getClientName = (reservation: Reservation) => {
    if (!reservation.client) {
      return "Client non renseigné";
    }

    if (reservation.client.full_name) {
      return reservation.client.full_name;
    }

    return (
      `${reservation.client.first_name || ""} ${
        reservation.client.last_name || ""
      }`.trim() || "Client non renseigné"
    );
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "CONFIRMEE":
        return "Confirmée";

      case "EN_ATTENTE":
        return "En attente";

      case "ANNULEE":
        return "Annulée";

      case "EVENT_TERMINE":
        return "Événement terminé";

      case "CLOTUREE":
        return "Clôturée";

      default:
        return status || "Non défini";
    }
  };

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">

      {/* ================================================= */}
      {/* EN-TÊTE */}
      {/* ================================================= */}

      <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-indigo-50 p-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Planning
            </h1>

            <p className="text-sm text-gray-500">
              {monthNames[currentDate.getMonth()]} {year}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={prevMonth}
            className="rounded-lg border p-2 transition hover:bg-gray-100"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="rounded-lg border p-2 transition hover:bg-gray-100"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

        </div>
      </div>

      {/* ================================================= */}
      {/* ERREUR */}
      {/* ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* CHARGEMENT */}
      {/* ================================================= */}

      {loading ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="animate-pulse font-medium text-gray-500">
            Chargement des réservations...
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          {/* ================================================= */}
          {/* AUCUNE RÉSERVATION */}
          {/* ================================================= */}

          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">

              <AlertCircle className="h-10 w-10 text-gray-300" />

              <div>
                <p className="font-medium text-gray-700">
                  Aucune réservation pour ce mois
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {monthNames[currentDate.getMonth()]} {year}
                </p>
              </div>

            </div>
          ) : (

            /* ================================================= */
            /* RÉSERVATIONS */
            /* ================================================= */

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

              {events.map((reservation) => (

                <article
                  key={reservation.id}
                  className="rounded-xl border bg-gray-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                >

                  {/* Référence + statut */}
                  <div className="mb-3 flex items-start justify-between gap-2">

                    <span className="rounded border bg-white px-2 py-1 font-mono text-xs font-bold text-gray-700">
                      {reservation.reservation_number ||
                        `RES-${reservation.id}`}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(
                        reservation.status
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>

                  </div>

                  {/* Client */}
                  <h2 className="font-semibold text-gray-800">
                    {getClientName(reservation)}
                  </h2>

                  {/* Salle */}
                  <p className="mt-2 text-sm text-gray-600">
                    Salle :{" "}
                    <span className="font-medium text-gray-800">
                      {reservation.hall?.name ||
                        "Salle non renseignée"}
                    </span>
                  </p>

                  {/* Événement */}
                  <p className="text-sm text-gray-600">
                    Événement :{" "}
                    <span className="font-medium text-gray-800">
                      {reservation.event_type ||
                        "Non renseigné"}
                    </span>
                  </p>

                  {/* Date */}
                  <p className="mt-2 text-sm text-gray-600">
                    Date :{" "}
                    <span className="font-medium text-gray-800">
                      {reservation.event_date}
                    </span>
                  </p>

                  {/* Horaire */}
                  <p className="text-sm text-gray-600">
                    Horaire :{" "}
                    <span className="font-medium text-gray-800">
                      {reservation.start_time || "--:--"}
                      {" - "}
                      {reservation.end_time || "--:--"}
                    </span>
                  </p>

                  {/* Montant */}
                  <div className="mt-4 border-t pt-3">

                    <p className="text-xs text-gray-500">
                      Montant du contrat
                    </p>

                    <p className="text-lg font-bold text-gray-800">
                      {Number(
                        reservation.total_amount || 0
                      ).toLocaleString("fr-FR")}{" "}
                      $
                    </p>

                  </div>

                </article>
              ))}

            </div>
          )}

        </div>
      )}
    </div>
  );
}