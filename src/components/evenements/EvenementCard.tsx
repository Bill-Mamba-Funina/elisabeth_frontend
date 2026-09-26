"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";

export interface Evenement {
  id: number | string;
  reservation_number: string;
  client: {
    id: number | string;
    full_name: string;
  } | number | string;
  hall: {
    id: number | string;
    name: string;
  } | number | string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
};

function getClientName(client: Evenement["client"]) {
  if (typeof client === "object" && client !== null) {
    return client.full_name;
  }

  return `Client #${client}`;
}

function getHallName(hall: Evenement["hall"]) {
  if (typeof hall === "object" && hall !== null) {
    return hall.name;
  }

  return `Salle #${hall}`;
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusClass(status: string) {
  switch (status) {
    case "CONFIRMEE":
      return "bg-green-100 text-green-700";

    case "EN_COURS":
      return "bg-blue-100 text-blue-700";

    case "TERMINEE":
    case "CLOTUREE":
      return "bg-gray-100 text-gray-700";

    case "ANNULEE":
      return "bg-red-100 text-red-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function EvenementCard({
  evenement,
}: {
  evenement: Evenement;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-400">
              {evenement.reservation_number}
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {evenement.event_type}
            </h2>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
              evenement.status
            )}`}
          >
            {STATUS_LABELS[evenement.status] ?? evenement.status}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <UserRound className="h-4 w-4 text-gray-400" />

          <div>
            <p className="text-xs text-gray-400">Client</p>
            <p className="text-sm font-medium text-gray-800">
              {getClientName(evenement.client)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-gray-400" />

          <div>
            <p className="text-xs text-gray-400">Salle</p>
            <p className="text-sm font-medium text-gray-800">
              {getHallName(evenement.hall)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-gray-400" />

          <div>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(evenement.event_date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-400" />

          <div>
            <p className="text-xs text-gray-400">Horaire</p>
            <p className="text-sm font-medium text-gray-800">
              {evenement.start_time} → {evenement.end_time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-gray-400" />

          <div>
            <p className="text-xs text-gray-400">Invités</p>
            <p className="text-sm font-medium text-gray-800">
              {evenement.guest_count}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <Link
          href={`/reservations/${evenement.id}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Voir la réservation
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}