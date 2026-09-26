"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import EvenementCard, {
  Evenement,
} from "@/components/evenements/EvenementCard";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
};

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [dateFilter, setDateFilter] = useState("");

  async function loadEvenements(refresh = false) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(API_ROUTES.RESERVATIONS, {
        params: {
          page_size: 1000,
        },
      });

      const data =
        response.data?.results ??
        response.data ??
        [];

      setEvenements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des événements :",
        error
      );

      setEvenements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEvenements();
  }, []);

  const eventTypes = useMemo(() => {
    return Array.from(
      new Set(
        evenements
          .map((event) => event.event_type)
          .filter(Boolean)
      )
    );
  }, [evenements]);

  const filteredEvents = useMemo(() => {
    const value = search.toLowerCase().trim();

    return evenements.filter((event) => {
      const clientName =
        typeof event.client === "object" && event.client
          ? event.client.full_name
          : `Client #${event.client}`;

      const hallName =
        typeof event.hall === "object" && event.hall
          ? event.hall.name
          : `Salle #${event.hall}`;

      const matchesSearch =
        !value ||
        event.reservation_number
          ?.toLowerCase()
          .includes(value) ||
        event.event_type
          ?.toLowerCase()
          .includes(value) ||
        clientName.toLowerCase().includes(value) ||
        hallName.toLowerCase().includes(value);

      const matchesType =
        typeFilter === "TOUS" ||
        event.event_type === typeFilter;

      const matchesStatus =
        statusFilter === "TOUS" ||
        event.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        event.event_date === dateFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    evenements,
    search,
    typeFilter,
    statusFilter,
    dateFilter,
  ]);

  function resetFilters() {
    setSearch("");
    setTypeFilter("TOUS");
    setStatusFilter("TOUS");
    setDateFilter("");
  }

  return (
    <div className="space-y-6 p-6">
      {/* EN-TÊTE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Événements
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Les événements sont automatiquement affichés à partir
            des réservations enregistrées.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadEvenements(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          Actualiser
        </button>
      </div>

      {/* FILTRES */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />

          <h2 className="font-semibold text-gray-900">
            Filtres
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Client, événement, réservation, salle..."
              className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="TOUS">Tous les types</option>

            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="TOUS">Tous les statuts</option>

            {Object.entries(STATUS_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />

            Réinitialiser
          </button>

          <span className="text-sm text-gray-500">
            {filteredEvents.length} événement
            {filteredEvents.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* CONTENU */}
      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin" />

          <p className="mt-3">
            Chargement des événements...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-3 font-semibold text-gray-900">
            Aucun événement trouvé
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Les événements apparaîtront ici lorsqu'une
            réservation sera enregistrée.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((evenement) => (
            <EvenementCard
              key={evenement.id}
              evenement={evenement}
            />
          ))}
        </div>
      )}
    </div>
  );
}