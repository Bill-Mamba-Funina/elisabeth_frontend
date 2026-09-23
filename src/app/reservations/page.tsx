"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Client {
  id: number;
  full_name: string;
}

interface Reservation {
  id: number;
  reservation_number: string;

  client: number | { id: number; full_name?: string };
  client_name?: string;

  hall: number | { id: number; name?: string };
  hall_name?: string;

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

  status: string;
}

function getClientName(reservation: Reservation) {
  if (reservation.client_name) {
    return reservation.client_name;
  }

  if (
    typeof reservation.client === "object" &&
    reservation.client
  ) {
    return (
      reservation.client.full_name ||
      `Client #${reservation.client.id}`
    );
  }

  return `Client #${reservation.client}`;
}

function getHallName(reservation: Reservation) {
  if (reservation.hall_name) {
    return reservation.hall_name;
  }

  if (
    typeof reservation.hall === "object" &&
    reservation.hall
  ) {
    return (
      reservation.hall.name ||
      `Salle #${reservation.hall.id}`
    );
  }

  return `Salle #${reservation.hall}`;
}

export default function ReservationsPage() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [clients, setClients] = useState<Client[]>([]);

  const [clientFilter, setClientFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [reservationsResponse, clientsResponse] =
        await Promise.all([
          api.get(
            `${API_ROUTES.RESERVATIONS}?page_size=1000`
          ),
          api.get(
            `${API_ROUTES.CLIENTS}?page_size=1000`
          ),
        ]);

      const reservationsData =
        reservationsResponse.data;

      const clientsData = clientsResponse.data;

      setReservations(
        Array.isArray(reservationsData)
          ? reservationsData
          : reservationsData?.results || []
      );

      setClients(
        Array.isArray(clientsData)
          ? clientsData
          : clientsData?.results || []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "Impossible de charger les réservations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const clientName =
        getClientName(reservation).toLowerCase();

      const matchesClient =
        !clientFilter ||
        String(
          typeof reservation.client === "object"
            ? reservation.client.id
            : reservation.client
        ) === clientFilter;

      const matchesStatus =
        !statusFilter ||
        reservation.status === statusFilter;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        reservation.reservation_number
          .toLowerCase()
          .includes(searchValue) ||
        clientName.includes(searchValue) ||
        getHallName(reservation)
          .toLowerCase()
          .includes(searchValue);

      return (
        matchesClient &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    reservations,
    clientFilter,
    statusFilter,
    search,
  ]);

  const paidCount = reservations.filter(
    (item) => item.payment_status === "PAYE"
  ).length;

  const pendingCount = reservations.filter(
    (item) => item.status === "EN_ATTENTE"
  ).length;

  const confirmedCount = reservations.filter(
    (item) => item.status === "CONFIRMEE"
  ).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Réservations
          </h1>

          <p className="mt-1 text-sm text-white/60">
            Toutes les réservations de La Casa da Festa Elisabeth.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>

          <Link
            href="/reservations/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouvelle réservation
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">
            Total
          </p>
          <p className="mt-2 text-2xl font-bold">
            {reservations.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">
            En attente
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-400">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">
            Confirmées
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {confirmedCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">
            Entièrement payées
          </p>
          <p className="mt-2 text-2xl font-bold text-green-400">
            {paidCount}
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
        />

        <select
          value={clientFilter}
          onChange={(e) =>
            setClientFilter(e.target.value)
          }
          className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
        >
          <option value="">
            Tous les clients
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

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
        >
          <option value="">
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-white/50">
            Aucune réservation trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-4">
                    Référence
                  </th>
                  <th className="px-4 py-4">
                    Client
                  </th>
                  <th className="px-4 py-4">
                    Salle
                  </th>
                  <th className="px-4 py-4">
                    Date
                  </th>
                  <th className="px-4 py-4">
                    Statut
                  </th>
                  <th className="px-4 py-4">
                    Paiement
                  </th>
                  <th className="px-4 py-4">
                    Reste
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReservations.map(
                  (reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-white/5 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {reservation.reservation_number}
                      </td>

                      <td className="px-4 py-4">
                        {getClientName(reservation)}
                      </td>

                      <td className="px-4 py-4 text-white/70">
                        {getHallName(reservation)}
                      </td>

                      <td className="px-4 py-4">
                        {reservation.event_date}
                        <div className="text-xs text-white/40">
                          {reservation.start_time} -{" "}
                          {reservation.end_time}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {reservation.status}
                      </td>

                      <td className="px-4 py-4">
                        {reservation.payment_status}
                      </td>

                      <td className="px-4 py-4">
                        {Number(
                          reservation.remaining_amount
                        ).toLocaleString()}{" "}
                        $
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
