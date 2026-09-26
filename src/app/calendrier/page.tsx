"use client";

import { useEffect, useMemo, useState } from "react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface CalendarReservation {
  id: number;
  reservation_number: string;
  client: string | null;
  hall: string | null;
  event_type: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
}

interface CalendarResponse {
  year: number;
  month: number;
  count: number;
  results: CalendarReservation[];
}

export default function CalendrierPage() {
  const today = new Date();

  const [year, setYear] = useState(
    today.getFullYear()
  );

  const [month, setMonth] = useState(
    today.getMonth() + 1
  );

  const [data, setData] =
    useState<CalendarResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCalendar() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/calendar/${year}/${month}/`
      );

      setData(response.data);
    } catch (error: any) {
      console.error(
        "Erreur calendrier :",
        error?.response?.data || error
      );

      setError(
        error?.response?.data?.detail ||
        "Impossible de charger le calendrier."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCalendar();
  }, [year, month]);

  const monthName = useMemo(() => {
    return new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  function previousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((value) => value - 1);
    } else {
      setMonth((value) => value - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((value) => value + 1);
    } else {
      setMonth((value) => value + 1);
    }
  }

  return (
    <section className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Calendrier
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Vue mensuelle des réservations enregistrées.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 hover:bg-slate-800"
          >
            ←
          </button>

          <span className="min-w-40 text-center font-semibold capitalize text-white">
            {monthName}
          </span>

          <button
            onClick={nextMonth}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 hover:bg-slate-800"
          >
            →
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-300">
          Chargement du calendrier...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.results.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-800"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">
                  {reservation.reservation_number}
                </span>

                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  {reservation.status}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <span className="text-slate-400">
                    Client :
                  </span>{" "}
                  <span className="text-white">
                    {reservation.client || "-"}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Salle :
                  </span>{" "}
                  <span className="text-white">
                    {reservation.hall || "-"}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Événement :
                  </span>{" "}
                  <span className="text-white">
                    {reservation.event_type || "-"}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Date :
                  </span>{" "}
                  <span className="text-white">
                    {reservation.date || "-"}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Horaire :
                  </span>{" "}
                  <span className="text-white">
                    {reservation.start_time} -{" "}
                    {reservation.end_time}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Paiement :
                  </span>{" "}
                  <span className="text-white">
                    {reservation.payment_status || "-"}
                  </span>
                </p>
              </div>
            </div>
          ))}

          {data?.results.length === 0 && (
            <div className="col-span-full rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
              Aucune réservation pour ce mois.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

