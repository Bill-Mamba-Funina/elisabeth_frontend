"use client";

import { useCallback, useEffect, useState } from "react";
import {
AlertCircle,
Bell,
CheckCircle2,
Clock,
DollarSign,
FileText,
Info,
Loader2,
RefreshCw,
CalendarDays,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Notification {
id: number | string;
title?: string;
message?: string;
type?: string;
notification_type?: string;
channel?: string;
status?: string;
is_read?: boolean;
read?: boolean;
amount?: number | string;
created_at?: string;
sent_at?: string;
reservation?: number | string | null;
reservation_number?: string;
client?: number | string | null;
client_name?: string;
}

interface NotificationResponse {
results?: Notification[];
}

function getNotificationType(notification: Notification): string {
return (
notification.type ??
notification.notification_type ??
"INFORMATION"
);
}

function getTypeLabel(type?: string): string {
const labels: Record<string, string> = {
IMPORTANT: "Important",
ATTENTION: "Attention",
RAPPEL: "Rappel",
DOCUMENT: "Document",
INFORMATION: "Information",
PAIEMENT: "Paiement",
RESERVATION: "Réservation",
CONTRAT: "Contrat",
};

return labels[type ?? ""] ?? type ?? "Information";
}

function getTypeClass(type?: string): string {
switch (type) {
case "IMPORTANT":
case "PAIEMENT":
return "border-red-500/20 bg-red-500/10 text-red-300";

case "ATTENTION":
case "RESERVATION":
  return "border-amber-500/20 bg-amber-500/10 text-amber-300";

case "RAPPEL":
  return "border-blue-500/20 bg-blue-500/10 text-blue-300";

case "DOCUMENT":
case "CONTRAT":
  return "border-purple-500/20 bg-purple-500/10 text-purple-300";

default:
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

}
}

function getTypeIcon(type?: string) {
switch (type) {
case "PAIEMENT":
return <DollarSign className="h-5 w-5" />;

case "RESERVATION":
  return <CalendarDays className="h-5 w-5" />;

case "CONTRAT":
case "DOCUMENT":
  return <FileText className="h-5 w-5" />;

case "RAPPEL":
  return <Clock className="h-5 w-5" />;

case "IMPORTANT":
case "ATTENTION":
  return <AlertCircle className="h-5 w-5" />;

default:
  return <Info className="h-5 w-5" />;


}
}

function getStatusLabel(status?: string): string {
const labels: Record<string, string> = {
EN_ATTENTE: "En attente",
ENVOYE: "Envoyée",
ENVOYEE: "Envoyée",
LU: "Lue",
NON_LU: "Non lue",
ECHEC: "Échec",
ANNULEE: "Annulée",
};

return labels[status ?? ""] ?? status ?? "";
}

function formatDate(value?: string): string {
if (!value) {
return "Date inconnue";
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return value;
}

return new Intl.DateTimeFormat("fr-FR", {
dateStyle: "medium",
timeStyle: "short",
}).format(date);
}

function formatMoney(value?: number | string): string {
return new Intl.NumberFormat("fr-FR", {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}).format(Number(value ?? 0));
}

export default function NotificationsPage() {
const [notifications, setNotifications] = useState<
Notification[]

> ([]);

const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");

const loadNotifications = useCallback(async () => {
try {
setError("");


  const response = await api.get(
    `${API_ROUTES.NOTIFICATIONS}?page_size=1000`
  );

  const data = response.data as
    | Notification[]
    | NotificationResponse;

  const notificationList = Array.isArray(data)
    ? data
    : data?.results ?? [];

  setNotifications(notificationList);
} catch (error: unknown) {
  console.error(
    "Erreur chargement notifications :",
    error
  );

  setError(
    "Impossible de récupérer les notifications."
  );
} finally {
  setLoading(false);
  setRefreshing(false);
}


}, []);

useEffect(() => {
loadNotifications();
}, [loadNotifications]);

async function handleRefresh() {
setRefreshing(true);
await loadNotifications();
}

const unreadCount = notifications.filter(
(notification) =>
notification.is_read === false ||
notification.read === false ||
notification.status === "NON_LU"
).length;

return ( <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8"> <div className="mx-auto max-w-6xl space-y-6">


    {/* EN-TÊTE */}
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
            <Bell className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Consultez les alertes et informations
              générées par l'activité de l'entreprise.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading || refreshing}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            refreshing ? "animate-spin" : ""
          }`}
        />

        Actualiser
      </button>
    </section>

    {/* STATISTIQUES */}
    {!loading && (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-400" />

            <div>
              <p className="text-sm text-slate-400">
                Notifications
              </p>

              <p className="mt-1 text-2xl font-bold">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400" />

            <div>
              <p className="text-sm text-slate-400">
                Non lues
              </p>

              <p className="mt-1 text-2xl font-bold">
                {unreadCount}
              </p>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* ERREUR */}
    {error && (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <p className="text-sm">
            {error}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setError("")}
          className="text-xl leading-none text-red-300 hover:text-white"
        >
          ×
        </button>
      </div>
    )}

    {/* CONTENU */}
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />

            <p className="text-sm text-slate-400">
              Chargement des notifications...
            </p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-slate-800 p-4">
            <Bell className="h-8 w-8 text-slate-500" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Aucune notification
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            Les notifications générées par les
            réservations, paiements, contrats et autres
            opérations apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const type = getNotificationType(
              notification
            );

            const isUnread =
              notification.is_read === false ||
              notification.read === false ||
              notification.status === "NON_LU";

            return (
              <article
                key={notification.id}
                className={`rounded-xl border p-5 transition ${
                  isUnread
                    ? "border-blue-500/20 bg-blue-500/[0.04]"
                    : "border-slate-800 bg-slate-950/40"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  <div className="flex gap-4">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getTypeClass(
                        type
                      )}`}
                    >
                      {getTypeIcon(type)}
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {notification.title ??
                            "Notification"}
                        </h2>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getTypeClass(
                            type
                          )}`}
                        >
                          {getTypeLabel(type)}
                        </span>

                        {isUnread && (
                          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                            Non lue
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {notification.message ??
                          "Aucun message disponible."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                        {(notification.created_at ||
                          notification.sent_at) && (
                          <span>
                            {formatDate(
                              notification.created_at ??
                                notification.sent_at
                            )}
                          </span>
                        )}

                        {notification.channel && (
                          <span>
                            Canal :{" "}
                            {notification.channel}
                          </span>
                        )}

                        {notification.status && (
                          <span>
                            Statut :{" "}
                            {getStatusLabel(
                              notification.status
                            )}
                          </span>
                        )}

                        {notification.reservation_number && (
                          <span>
                            Réservation :{" "}
                            {
                              notification.reservation_number
                            }
                          </span>
                        )}

                        {notification.client_name && (
                          <span>
                            Client :{" "}
                            {notification.client_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {notification.amount !== undefined &&
                    notification.amount !== null && (
                      <div className="shrink-0 lg:text-right">
                        <p className="text-xs text-slate-500">
                          Montant
                        </p>

                        <p className="mt-1 font-semibold text-emerald-400">
                          {formatMoney(
                            notification.amount
                          )}{" "}
                          $
                        </p>
                      </div>
                    )}
                </div>

                {isUnread && (
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3 text-xs text-blue-300">
                    <CheckCircle2 className="h-4 w-4" />

                    Notification non lue
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  </div>
</main>


);
}
