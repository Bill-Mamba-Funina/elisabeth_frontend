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

  const [year, setYear] =
    useState(today.getFullYear());

  const [month, setMonth] =
    useState(today.getMonth() + 1);

  const [data, setData] =
    useState<CalendarResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCalendar() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `${API_ROUTES.CALENDAR}/${year}/${month}/`
      );

      setData(response.data);
    } catch (error: any) {
      console.error(error);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Calendrier
          </h1>

          <p className="text-white/60">
            Vue mensuelle des réservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10"
          >
            ←
          </button>

          <span className="min-w-40 text-center font-semibold capitalize">
            {monthName}
          </span>

          <button
            onClick={nextMonth}
            className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10"
          >
            →
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          Chargement du calendrier...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.results.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {reservation.reservation_number}
                </span>

                <span className="text-xs text-white/50">
                  {reservation.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-white/50">
                    Client :
                  </span>{" "}
                  {reservation.client || "-"}
                </p>

                <p>
                  <span className="text-white/50">
                    Salle :
                  </span>{" "}
                  {reservation.hall || "-"}
                </p>

                <p>
                  <span className="text-white/50">
                    Événement :
                  </span>{" "}
                  {reservation.event_type}
                </p>

                <p>
                  <span className="text-white/50">
                    Horaire :
                  </span>{" "}
                  {reservation.start_time} -{" "}
                  {reservation.end_time}
                </p>
              </div>
            </div>
          ))}

          {data?.results.length === 0 && (
            <div className="col-span-full rounded-xl border border-white/10 p-12 text-center text-white/50">
              Aucune réservation pour ce mois.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
