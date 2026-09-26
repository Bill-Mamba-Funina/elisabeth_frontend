"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Client {
  id: number;
  full_name: string;
}

interface Hall {
  id: number;
  name: string;
}

interface Reservation {
  id: number;
  reservation_number: string;

  client: number | {
    id: number;
  };

  hall: number | {
    id: number;
  };

  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;

  total_amount: number | string;

  paid_amount: number | string;
  remaining_amount: number | string;

  payment_status:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE";

  status:
    | "EN_ATTENTE"
    | "CONFIRMEE"
    | "EN_COURS"
    | "TERMINEE"
    | "CLOTUREE"
    | "ANNULEE";
}

const STATUS_OPTIONS = [
  {
    value: "EN_ATTENTE",
    label: "En attente",
  },
  {
    value: "CONFIRMEE",
    label: "Confirmée",
  },
  {
    value: "EN_COURS",
    label: "En cours",
  },
  {
    value: "TERMINEE",
    label: "Terminée",
  },
  {
    value: "CLOTUREE",
    label: "Clôturée",
  },
  {
    value: "ANNULEE",
    label: "Annulée",
  },
];

function extractId(
  value: number | { id: number }
): number {
  return typeof value === "object"
    ? value.id
    : value;
}

function getErrorMessage(error: unknown): string {
  const axiosError = error as {
    response?: {
      data?: unknown;
    };
  };

  const data = axiosError.response?.data;

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const values = Object.values(
      data as Record<string, unknown>
    );

    for (const value of values) {
      if (Array.isArray(value) && value.length) {
        return String(value[0]);
      }

      if (value) {
        return String(value);
      }
    }
  }

  return "Impossible de modifier la réservation.";
}

export default function ModifierReservationPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [halls, setHalls] =
    useState<Hall[]>([]);

  const [clientId, setClientId] =
    useState("");

  const [hallId, setHallId] =
    useState("");

  const [eventType, setEventType] =
    useState("");

  const [eventDate, setEventDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [totalAmount, setTotalAmount] =
    useState("");

  const [status, setStatus] =
    useState("EN_ATTENTE");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          reservationResponse,
          clientsResponse,
          hallsResponse,
        ] = await Promise.all([
          api.get(
            `${API_ROUTES.RESERVATIONS}${id}/`
          ),

          api.get(
            `${API_ROUTES.CLIENTS}?page_size=1000`
          ),

          api.get(
            `${API_ROUTES.HALLS}?page_size=1000`
          ),
        ]);

        const reservationData =
          reservationResponse.data as Reservation;

        const clientsData =
          clientsResponse.data;

        const hallsData =
          hallsResponse.data;

        setReservation(reservationData);

        setClients(
          Array.isArray(clientsData)
            ? clientsData
            : clientsData?.results || []
        );

        setHalls(
          Array.isArray(hallsData)
            ? hallsData
            : hallsData?.results || []
        );

        setClientId(
          String(
            extractId(
              reservationData.client
            )
          )
        );

        setHallId(
          String(
            extractId(
              reservationData.hall
            )
          )
        );

        setEventType(
          reservationData.event_type || ""
        );

        setEventDate(
          reservationData.event_date || ""
        );

        setStartTime(
          reservationData.start_time || ""
        );

        setEndTime(
          reservationData.end_time || ""
        );

        setTotalAmount(
          String(
            reservationData.total_amount ?? ""
          )
        );

        setStatus(
          reservationData.status ||
            "EN_ATTENTE"
        );
      } catch (error: unknown) {
        console.error(error);

        setError(
          getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!reservation) {
      return;
    }

    setError("");
    setSuccess("");

    const amount = Number(totalAmount);

    if (!clientId) {
      setError("Veuillez sélectionner un client.");
      return;
    }

    if (!hallId) {
      setError("Veuillez sélectionner une salle.");
      return;
    }

    if (!eventType.trim()) {
      setError(
        "Veuillez renseigner le type d'événement."
      );
      return;
    }

    if (!eventDate) {
      setError(
        "Veuillez renseigner la date de l'événement."
      );
      return;
    }

    if (!startTime || !endTime) {
      setError(
        "Veuillez renseigner les heures."
      );
      return;
    }

    if (startTime >= endTime) {
      setError(
        "L'heure de fin doit être postérieure à l'heure de début."
      );
      return;
    }

    if (!amount || amount <= 0) {
      setError(
        "Veuillez saisir un montant total valide."
      );
      return;
    }

    const paidAmount = Number(
      reservation.paid_amount || 0
    );

    if (amount < paidAmount) {
      setError(
        `Le montant total ne peut pas être inférieur au montant déjà payé (${paidAmount.toFixed(
          2
        )} $).`
      );
      return;
    }

    try {
      setSaving(true);

      await api.patch(
        `${API_ROUTES.RESERVATIONS}${id}/`,
        {
          client: Number(clientId),
          hall: Number(hallId),
          event_type: eventType.trim(),
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          total_amount: amount.toFixed(2),
          status,
        }
      );

      setSuccess(
        "La réservation a été modifiée avec succès."
      );

      setTimeout(() => {
        router.push("/reservations");
      }, 700);
    } catch (error: unknown) {
      console.error(error);

      setError(
        getErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">
          Chargement de la réservation...
        </span>
      </section>
    );
  }

  if (!reservation) {
    return (
      <section className="space-y-4">
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux réservations
        </Link>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error ||
            "Réservation introuvable."}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/reservations"
            className="mb-3 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux réservations
          </Link>

          <h1 className="text-2xl font-bold">
            Modifier la réservation
          </h1>

          <p className="mt-1 text-sm text-white/60">
            {reservation.reservation_number}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-300">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Client
              </label>

              <select
                value={clientId}
                onChange={(e) =>
                  setClientId(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
              >
                <option value="">
                  Sélectionner un client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Salle
              </label>

              <select
                value={hallId}
                onChange={(e) =>
                  setHallId(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
              >
                <option value="">
                  Sélectionner une salle
                </option>

                {halls.map((hall) => (
                  <option
                    key={hall.id}
                    value={hall.id}
                  >
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Type d'événement
              </label>

              <input
                value={eventType}
                onChange={(e) =>
                  setEventType(e.target.value)
                }
                placeholder="Ex : Mariage, anniversaire..."
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Date
              </label>

              <input
                type="date"
                value={eventDate}
                onChange={(e) =>
                  setEventDate(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Heure de début
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Heure de fin
              </label>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Montant total
              </label>

              <input
                type="number"
                min={Number(
                  reservation.paid_amount || 0
                )}
                step="0.01"
                value={totalAmount}
                onChange={(e) =>
                  setTotalAmount(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-white/50">
                Déjà payé :{" "}
                {Number(
                  reservation.paid_amount || 0
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                $
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Statut
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
            <p className="font-semibold">
              Historique financier conservé
            </p>

            <p className="mt-1 text-blue-200/70">
              Les paiements déjà enregistrés ne
              seront ni supprimés ni modifiés.
              Le montant payé sera recalculé à
              partir de l'historique des paiements.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/reservations"
              className="rounded-lg border border-white/10 px-5 py-3 text-center text-sm font-semibold hover:bg-white/10"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}