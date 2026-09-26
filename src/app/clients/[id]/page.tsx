"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MessageCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Client {
  id: number | string;
  full_name: string;
  phone: string;
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

function formatMoney(value: number | string | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function getWhatsAppUrl(phone: string) {
  const cleanPhone = phone.replace(/\D/g, "");

  return `https://wa.me/${cleanPhone}`;
}

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>();

  const clientId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClientHistory() {
    if (!clientId) {
      setError("Identifiant du client introuvable.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
       * =====================================================
       * CLIENT
       * =====================================================
       *
       * API_ROUTES.CLIENTS doit être :
       *
       * /clients/
       *
       * On ajoute directement l'identifiant :
       *
       * /clients/ + 1
       *
       * = /clients/1/
       *
       * Cela évite :
       *
       * /clients//1/
       */

      const clientUrl =
        `${API_ROUTES.CLIENTS.replace(/\/+$/, "")}/${clientId}/`;

      console.log("[CLIENT] GET", clientUrl);

      const clientResponse = await api.get(clientUrl);

      setClient(clientResponse.data);

      /*
       * =====================================================
       * RESERVATIONS DU CLIENT
       * =====================================================
       */

      const reservationsBaseUrl =
        API_ROUTES.RESERVATIONS.replace(/\/+$/, "");

      const reservationsResponse = await api.get(
        `${reservationsBaseUrl}/?client=${encodeURIComponent(
          clientId
        )}&page_size=100`
      );

      const reservationsData = reservationsResponse.data;

      const reservationsList: Reservation[] = Array.isArray(
        reservationsData
      )
        ? reservationsData
        : Array.isArray(reservationsData?.results)
          ? reservationsData.results
          : [];

      setReservations(reservationsList);

      /*
       * =====================================================
       * PAIEMENTS
       * =====================================================
       *
       * On récupère les paiements réservation par réservation.
       */

      const paymentsBaseUrl =
        API_ROUTES.PAYMENTS.replace(/\/+$/, "");

      const paymentResponses = await Promise.all(
        reservationsList.map(async (reservation) => {
          try {
            const response = await api.get(
              `${paymentsBaseUrl}/?reservation=${encodeURIComponent(
                String(reservation.id)
              )}&page_size=100`
            );

            const data = response.data;

            return Array.isArray(data)
              ? data
              : Array.isArray(data?.results)
                ? data.results
                : [];
          } catch (paymentError) {
            console.error(
              `Erreur paiement réservation ${reservation.id}:`,
              paymentError
            );

            return [];
          }
        })
      );

      const allPayments: Payment[] =
        paymentResponses.flat();

      setPayments(allPayments);
    } catch (error: any) {
      console.error(
        "[CLIENT HISTORY ERROR]",
        error
      );

      console.error(
        "[CLIENT HISTORY RESPONSE]",
        error?.response?.data
      );

      setError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Impossible de charger l'historique du client."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientHistory();
  }, [clientId]);

  const totalReservations = reservations.length;

  const totalPayments = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount ?? 0),
    0
  );

  return (
    <section className="min-h-screen space-y-6 bg-slate-950 p-6 text-slate-100">

      {/* =====================================================
          RETOUR
      ===================================================== */}

      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux clients
        </Link>
      </div>

      {/* =====================================================
          ERREUR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          CHARGEMENT
      ===================================================== */}

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
          {/* =================================================
              INFORMATIONS CLIENT
          ================================================= */}

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
                      href={getWhatsAppUrl(client.phone)}
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

                </div>
              </div>

              <button
                type="button"
                onClick={loadClientHistory}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                Actualiser
              </button>

            </div>

          </div>

          {/* =================================================
              STATISTIQUES
          ================================================= */}

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

          {/* =================================================
              HISTORIQUE DES RESERVATIONS
          ================================================= */}

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-6 py-4">

              <h2 className="text-lg font-semibold text-white">
                Historique des réservations
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Toutes les réservations associées à ce client.
              </p>

            </div>

            {reservations.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucune réservation pour ce client.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

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

                    {reservations.map(
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
                            {reservation.event_type || "-"}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {formatDate(
                              reservation.event_date
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {reservation.hall?.name || "-"}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {formatMoney(
                              reservation.total_amount
                            )}
                          </td>

                          <td className="px-5 py-4 text-green-400">
                            {formatMoney(
                              reservation.paid_amount
                            )}
                          </td>

                          <td className="px-5 py-4 text-orange-400">
                            {formatMoney(
                              reservation.remaining_amount
                            )}
                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                              {reservation.status || "-"}
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* =================================================
              HISTORIQUE DES PAIEMENTS
          ================================================= */}

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-6 py-4">

              <h2 className="text-lg font-semibold text-white">
                Historique des paiements
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Tous les paiements liés aux réservations de ce client.
              </p>

            </div>

            {payments.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucun paiement enregistré pour ce client.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

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

                    {payments.map((payment, index) => {

                      const reservation =
                        typeof payment.reservation ===
                        "object"
                          ? payment.reservation
                          : null;

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
                              payment.payment_date
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-300">

                            {reservation?.reservation_number ||
                              (typeof payment.reservation ===
                              "number" ||
                              typeof payment.reservation ===
                                "string"
                                ? `#${payment.reservation}`
                                : "-")}

                          </td>

                          <td className="px-5 py-4 font-semibold text-green-400">
                            {formatMoney(
                              payment.amount
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
                    })}

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

