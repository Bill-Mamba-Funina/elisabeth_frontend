"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

import ReservationStatus from "./ReservationStatus";

type PaymentMethod =
  | "ESPECES"
  | "VIREMENT_BANCAIRE"
  | "MOBILE_MONEY"
  | "CARTE"
  | "CHEQUE"
  | "AUTRE";

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "ESPECES",
    label: "Espèces",
  },
  {
    value: "VIREMENT_BANCAIRE",
    label: "Virement bancaire",
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
  },
  {
    value: "CARTE",
    label: "Carte bancaire",
  },
  {
    value: "CHEQUE",
    label: "Chèque",
  },
  {
    value: "AUTRE",
    label: "Autre",
  },
];

interface Reservation {
  id: number | string;

  reference: string;

  client: string;

  salle: string;

  date: string;

  statut: string;

  montant: number | string;

  montantPaye?: number | string;

  resteAPayer?: number | string;

  paymentStatus?:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE";
}

interface ReservationTableProps {
  reservations: Reservation[];

  onRefresh?: () => void | Promise<void>;
}

const STATUS_LABELS: Record<
  string,
  string
> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  CLOTUREE: "Clôturée",
  ANNULEE: "Annulée",
};

function getStatusClass(status: string) {
  switch (status) {
    case "CONFIRMEE":
      return "bg-emerald-100 text-emerald-700";

    case "EN_COURS":
      return "bg-blue-100 text-blue-700";

    case "TERMINEE":
      return "bg-purple-100 text-purple-700";

    case "CLOTUREE":
      return "bg-slate-200 text-slate-700";

    case "ANNULEE":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function ReservationTable({
  reservations,
  onRefresh,
}: ReservationTableProps) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("TOUS");

  const [paymentFilter, setPaymentFilter] =
    useState("TOUS");

  const [paymentReservationId, setPaymentReservationId] =
    useState<number | string | null>(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("ESPECES");

  const [processingPayment, setProcessingPayment] =
    useState<number | string | null>(null);

  const [processingDelete, setProcessingDelete] =
    useState<number | string | null>(null);

  const [cancellingReservation, setCancellingReservation] =
    useState<number | string | null>(null);

  const [error, setError] =
    useState("");

  const filteredReservations =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return reservations.filter(
        (reservation) => {
          const matchesSearch =
            !term ||
            reservation.reference
              .toLowerCase()
              .includes(term) ||
            reservation.client
              .toLowerCase()
              .includes(term) ||
            reservation.salle
              .toLowerCase()
              .includes(term);

          const matchesStatus =
            statusFilter === "TOUS" ||
            reservation.statut ===
              statusFilter;

          const matchesPayment =
            paymentFilter === "TOUS" ||
            reservation.paymentStatus ===
              paymentFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
          );
        }
      );
    }, [
      reservations,
      search,
      statusFilter,
      paymentFilter,
    ]);

  function openPayment(
    reservation: Reservation
  ) {
    const remaining = Math.max(
      0,
      Number(
        reservation.resteAPayer ??
          Number(reservation.montant || 0) -
            Number(
              reservation.montantPaye || 0
            )
      )
    );

    setPaymentReservationId(
      reservation.id
    );

    setPaymentAmount(
      remaining.toFixed(2)
    );

    setPaymentMethod("ESPECES");
    setError("");
  }

  function closePayment() {
    setPaymentReservationId(null);
    setPaymentAmount("");
    setPaymentMethod("ESPECES");
  }

  async function handlePayment(
    reservation: Reservation
  ) {
    const amount = Number(paymentAmount);

    const remaining = Math.max(
      0,
      Number(
        reservation.resteAPayer ??
          Number(reservation.montant || 0) -
            Number(
              reservation.montantPaye || 0
            )
      )
    );

    if (!amount || amount <= 0) {
      setError(
        "Veuillez saisir un montant valide."
      );
      return;
    }

    if (amount > remaining) {
      setError(
        `Le paiement ne peut pas dépasser le reste à payer de ${remaining.toLocaleString(
          "fr-FR"
        )} $.`
      );
      return;
    }

    try {
      setProcessingPayment(
        reservation.id
      );

      setError("");

      await api.post(
        API_ROUTES.PAYMENTS,
        {
          reservation: Number(
            reservation.id
          ),
          amount: amount.toFixed(2),
          method: paymentMethod,
          reference: "",
        }
      );

      closePayment();

      await onRefresh?.();
    } catch (err: unknown) {
      console.error(
        "Erreur paiement :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible d'enregistrer le paiement."
        )
      );
    } finally {
      setProcessingPayment(null);
    }
  }

  async function handleCancel(
    reservation: Reservation
  ) {
    if (
      reservation.statut ===
      "ANNULEE"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment annuler la réservation ${reservation.reference} ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingReservation(
        reservation.id
      );

      setError("");

      await api.patch(
        `${API_ROUTES.RESERVATIONS}${reservation.id}/`,
        {
          status: "ANNULEE",
        }
      );

      await onRefresh?.();
    } catch (err: unknown) {
      console.error(
        "Erreur annulation :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible d'annuler la réservation."
        )
      );
    } finally {
      setCancellingReservation(
        null
      );
    }
  }

  async function handleDelete(
    reservation: Reservation
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous supprimer définitivement la réservation ${reservation.reference} ?\n\nCette opération peut être refusée si la réservation possède déjà des paiements.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingDelete(
        reservation.id
      );

      setError("");

      await api.delete(
        `${API_ROUTES.RESERVATIONS}${reservation.id}/`
      );

      await onRefresh?.();
    } catch (err: unknown) {
      console.error(
        "Erreur suppression :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible de supprimer la réservation."
        )
      );
    } finally {
      setProcessingDelete(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <div className="border-b border-slate-800 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher par référence, client ou salle..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
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

          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="TOUS">
              Tous les paiements
            </option>

            <option value="NON_PAYE">
              Non payé
            </option>

            <option value="PARTIEL">
              Partiel
            </option>

            <option value="PAYE">
              Payé
            </option>
          </select>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {filteredReservations.length} réservation(s)
          affichée(s) sur{" "}
          {reservations.length}.
        </div>
      </div>

      {error && (
        <div className="border-b border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1450px] text-left text-sm">
          <thead className="bg-slate-950">
            <tr className="border-b border-slate-800">
              <th className="px-5 py-3 text-slate-400">
                N°
              </th>

              <th className="px-5 py-3 text-slate-400">
                Référence
              </th>

              <th className="px-5 py-3 text-slate-400">
                Client
              </th>

              <th className="px-5 py-3 text-slate-400">
                Salle
              </th>

              <th className="px-5 py-3 text-slate-400">
                Date
              </th>

              <th className="px-5 py-3 text-slate-400">
                Statut
              </th>

              <th className="px-5 py-3 text-slate-400">
                Paiement
              </th>

              <th className="px-5 py-3 text-slate-400">
                Montant
              </th>

              <th className="px-5 py-3 text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredReservations.map(
              (reservation, index) => {
                const montant = Number(
                  reservation.montant || 0
                );

                const montantPaye =
                  Number(
                    reservation.montantPaye ||
                      0
                  );

                const resteAPayer =
                  Math.max(
                    0,
                    Number(
                      reservation.resteAPayer ??
                        montant -
                          montantPaye
                    )
                  );

                const isCancelled =
                  reservation.statut ===
                  "ANNULEE";

                const isPaid =
                  resteAPayer <= 0 ||
                  reservation.paymentStatus ===
                    "PAYE";

                const isPaymentOpen =
                  paymentReservationId ===
                  reservation.id;

                const isProcessing =
                  processingPayment ===
                  reservation.id;

                const isCancelling =
                  cancellingReservation ===
                  reservation.id;

                const isDeleting =
                  processingDelete ===
                  reservation.id;

                return (
                  <tr
                    key={reservation.id}
                    className="border-b border-slate-800 align-top transition hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4 font-bold text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4 font-semibold text-white">
                      {reservation.reference}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {reservation.client}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {reservation.salle}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {reservation.date}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          reservation.statut
                        )}`}
                      >
                        {STATUS_LABELS[
                          reservation.statut
                        ] ||
                          reservation.statut}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <ReservationStatus
                        totalAmount={
                          montant
                        }
                        paidAmount={
                          montantPaye
                        }
                        remainingAmount={
                          resteAPayer
                        }
                        paymentStatus={
                          reservation.paymentStatus ||
                          "NON_PAYE"
                        }
                      />

                      {!isCancelled &&
                        !isPaid &&
                        isPaymentOpen && (
                          <div className="mt-3 w-64 space-y-2 rounded-lg border border-slate-700 bg-slate-950 p-3">
                            <select
                              value={
                                paymentMethod
                              }
                              onChange={(
                                event
                              ) =>
                                setPaymentMethod(
                                  event.target
                                    .value as PaymentMethod
                                )
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                            >
                              {PAYMENT_METHODS.map(
                                (
                                  method
                                ) => (
                                  <option
                                    key={
                                      method.value
                                    }
                                    value={
                                      method.value
                                    }
                                  >
                                    {
                                      method.label
                                    }
                                  </option>
                                )
                              )}
                            </select>

                            <input
                              type="number"
                              min="0.01"
                              max={
                                resteAPayer
                              }
                              step="0.01"
                              value={
                                paymentAmount
                              }
                              onChange={(
                                event
                              ) =>
                                setPaymentAmount(
                                  event.target
                                    .value
                                )
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                              placeholder="Montant"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handlePayment(
                                  reservation
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}

                              Valider paiement
                            </button>

                            <button
                              type="button"
                              onClick={
                                closePayment
                              }
                              className="w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                            >
                              Fermer
                            </button>
                          </div>
                        )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">
                        {montant.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        $
                      </div>

                      <div className="mt-1 text-xs text-emerald-400">
                        Payé :{" "}
                        {montantPaye.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        $
                      </div>

                      <div className="text-xs text-red-400">
                        Reste :{" "}
                        {resteAPayer.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        $
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex min-w-[190px] flex-col gap-2">
                        {!isCancelled &&
                          !isPaid && (
                            <button
                              type="button"
                              onClick={() =>
                                isPaymentOpen
                                  ? closePayment()
                                  : openPayment(
                                      reservation
                                    )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />

                              {isPaymentOpen
                                ? "Fermer"
                                : "Payer"}
                            </button>
                          )}

                        <Link
                          href={`/reservations/${reservation.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-800 bg-blue-950/40 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-900/40"
                        >
                          <Edit className="h-4 w-4" />

                          Modifier
                        </Link>

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(
                                reservation
                              )
                            }
                            disabled={
                              isCancelling
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 disabled:opacity-50"
                          >
                            {isCancelling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}

                            Annuler
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              reservation
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {filteredReservations.length ===
        0 && (
        <div className="p-10 text-center">
          <p className="text-slate-400">
            Aucune réservation trouvée.
          </p>
        </div>
      )}
    </div>
  );
}

function extractApiError(
  error: unknown,
  fallback: string
): string {
  const axiosError = error as {
    response?: {
      data?: unknown;
    };
    message?: string;
  };

  const data =
    axiosError.response?.data;

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const entries = Object.entries(
      data as Record<string, unknown>
    );

    const messages = entries.map(
      ([field, value]) => {
        if (Array.isArray(value)) {
          return `${field} : ${value.join(
            ", "
          )}`;
        }

        return `${field} : ${String(value)}`;
      }
    );

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return (
    axiosError.message ||
    fallback
  );
}

