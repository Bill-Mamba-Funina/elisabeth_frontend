"use client";

import { useState } from "react";
import Link from "next/link";
import {
CheckCircle2,
Loader2,
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

type Reservation = {
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
};

interface ReservationTableProps {
reservations: Reservation[];

onRefresh?: () => void | Promise<void>;
}

export default function ReservationTable({
reservations,
onRefresh,
}: ReservationTableProps) {
const [paymentReservationId, setPaymentReservationId] =
useState<number | string | null>(null);

const [paymentAmount, setPaymentAmount] =
useState("");

const [paymentMethod, setPaymentMethod] =
useState<PaymentMethod>("ESPECES");

const [processingPayment, setProcessingPayment] =
useState<number | string | null>(null);

const [cancellingReservation, setCancellingReservation] =
useState<number | string | null>(null);

const [error, setError] = useState("");

function openPayment(reservation: Reservation) {
const remaining = Number(
reservation.resteAPayer ??
Number(reservation.montant || 0) -
Number(reservation.montantPaye || 0)
);


setPaymentReservationId(reservation.id);
setPaymentAmount(
  Math.max(0, remaining).toFixed(2)
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
        Number(reservation.montantPaye || 0)
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
  setProcessingPayment(reservation.id);
  setError("");

  await api.post(
    API_ROUTES.PAYMENTS,
    {
      reservation: Number(reservation.id),
      amount: amount.toFixed(2),
      method: paymentMethod,
      reference: "",
    }
  );

  closePayment();

  await onRefresh?.();
} catch (error: any) {
  console.error(
    "Erreur paiement :",
    error
  );

  const responseData =
    error?.response?.data;

  if (
    responseData &&
    typeof responseData === "object"
  ) {
    const messages = Object.entries(
      responseData
    )
      .map(([field, value]) => {
        if (Array.isArray(value)) {
          return `${field} : ${value.join(", ")}`;
        }

        return `${field} : ${String(value)}`;
      })
      .join(" | ");

    setError(
      messages ||
        "Impossible d'enregistrer le paiement."
    );
  } else {
    setError(
      error?.message ||
        "Impossible d'enregistrer le paiement."
    );
  }
} finally {
  setProcessingPayment(null);
}


}

async function handleCancel(
reservation: Reservation
) {
if (
reservation.statut === "ANNULEE" ||
reservation.statut === "Annulée"
) {
return;
}


const confirmed = window.confirm(
  `Voulez-vous vraiment annuler la réservation ${reservation.reference} ?`
);

if (!confirmed) {
  return;
}

try {
  setCancellingReservation(reservation.id);
  setError("");

  await api.patch(
    `${API_ROUTES.RESERVATIONS}${reservation.id}/`,
    {
      status: "ANNULEE",
    }
  );

  await onRefresh?.();
} catch (error: any) {
  console.error(
    "Erreur annulation :",
    error
  );

  setError(
    error?.response?.data?.detail ||
      "Impossible d'annuler la réservation."
  );
} finally {
  setCancellingReservation(null);
}


}

return ( <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
{error && ( <div className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-700">
{error} </div>
)}

```
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1250px] text-left text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-5 py-3">
            N°
          </th>

          <th className="px-5 py-3">
            Référence
          </th>

          <th className="px-5 py-3">
            Client
          </th>

          <th className="px-5 py-3">
            Salle
          </th>

          <th className="px-5 py-3">
            Date
          </th>

          <th className="px-5 py-3">
            Statut
          </th>

          <th className="px-5 py-3">
            Paiement
          </th>

          <th className="px-5 py-3">
            Montant
          </th>

          <th className="px-5 py-3">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {reservations.map(
          (reservation, index) => {
            const montant = Number(
              reservation.montant || 0
            );

            const montantPaye = Number(
              reservation.montantPaye || 0
            );

            const resteAPayer = Math.max(
              0,
              Number(
                reservation.resteAPayer ??
                  montant - montantPaye
              )
            );

            const isCancelled =
              reservation.statut ===
                "ANNULEE" ||
              reservation.statut ===
                "Annulée";

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

            return (
              <tr
                key={reservation.id}
                className="border-t align-top hover:bg-gray-50"
              >
                {/* N° */}

                <td className="px-5 py-4 font-bold text-gray-500">
                  {index + 1}
                </td>

                {/* RÉFÉRENCE */}

                <td className="px-5 py-4 font-medium">
                  {reservation.reference}
                </td>

                {/* CLIENT */}

                <td className="px-5 py-4">
                  {reservation.client}
                </td>

                {/* SALLE */}

                <td className="px-5 py-4">
                  {reservation.salle}
                </td>

                {/* DATE */}

                <td className="px-5 py-4">
                  {reservation.date}
                </td>

                {/* STATUT */}

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isCancelled
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {reservation.statut}
                  </span>
                </td>

                {/* PAIEMENT */}

                <td className="px-5 py-4">
                  <ReservationStatus
                    totalAmount={montant}
                    paidAmount={montantPaye}
                    remainingAmount={resteAPayer}
                    paymentStatus={
                      reservation.paymentStatus ||
                      "NON_PAYE"
                    }
                  />

                  {!isCancelled &&
                    !isPaid &&
                    isPaymentOpen && (
                      <div className="mt-3 w-64 space-y-2 rounded-lg border bg-gray-50 p-3">
                        <select
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(
                              e.target
                                .value as PaymentMethod
                            )
                          }
                          className="w-full rounded-lg border bg-white px-3 py-2 text-xs"
                        >
                          {PAYMENT_METHODS.map(
                            (method) => (
                              <option
                                key={
                                  method.value
                                }
                                value={
                                  method.value
                                }
                              >
                                {method.label}
                              </option>
                            )
                          )}
                        </select>

                        <input
                          type="number"
                          min="0.01"
                          max={resteAPayer}
                          step="0.01"
                          value={paymentAmount}
                          onChange={(e) =>
                            setPaymentAmount(
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border bg-white px-3 py-2 text-xs"
                          placeholder="Montant"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handlePayment(
                              reservation
                            )
                          }
                          disabled={isProcessing}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
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
                          className="w-full rounded-lg border bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          Fermer
                        </button>
                      </div>
                    )}
                </td>

                {/* MONTANT */}

                <td className="px-5 py-4">
                  <div className="font-semibold">
                    {montant.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    $
                  </div>

                  <div className="mt-1 text-xs text-green-600">
                    Payé :{" "}
                    {montantPaye.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    $
                  </div>

                  <div className="text-xs text-red-600">
                    Reste :{" "}
                    {resteAPayer.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    $
                  </div>
                </td>

                {/* ACTIONS */}

                <td className="px-5 py-4">
                  <div className="flex min-w-[180px] flex-col gap-2">
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
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />

                          {isPaymentOpen
                            ? "Fermer"
                            : "Payer"}
                        </button>
                      )}

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCancel(
                            reservation
                          )
                        }
                        disabled={isCancelling}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}

                        Annuler
                      </button>
                    )}

                    <Link
                      href={`/reservations/${reservation.id}`}
                      className="text-center text-xs font-medium text-blue-600 hover:underline"
                    >
                      Voir détails
                    </Link>
                  </div>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  </div>

  {reservations.length === 0 && (
    <p className="p-8 text-center text-gray-500">
      Aucune réservation trouvée.
    </p>
  )}
</div>


);
}
