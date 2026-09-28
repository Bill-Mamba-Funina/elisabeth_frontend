"use client";

import {
FormEvent,
useEffect,
useState,
} from "react";

import api from "@/lib/api";

export type Reservation = {
id: number;

reservation_number?: string | null;

client?: {
id?: number;
full_name?: string | null;
phone?: string | null;
} | null;

client_name?: string | null;

tarif?: {
amount?: number | string | null;
} | null;

total_amount?: number | string | null;
};

export type FinancialAccount = {
id: number;
name: string;
account_type?: string | null;
balance?: number | string | null;
is_active?: boolean;
};

type PaymentModalProps = {
isOpen: boolean;

onClose: () => void;

reservation?: Reservation | null;

reservations?: Reservation[];

accounts?: FinancialAccount[];

onSuccess?: (payment: unknown) => void;
};

type PaymentFormData = {
reservation: string;
amount: string;
payment_date: string;

method:
| "ESPECES"
| "VIREMENT"
| "MOBILE_MONEY";

reference: string;

operator: string;

financial_account: string;

status:
| "VALIDE"
| "EN_ATTENTE";
};

const EMPTY_FORM: PaymentFormData = {
reservation: "",
amount: "",
payment_date: "",
method: "ESPECES",
reference: "",
operator: "",
financial_account: "",
status: "VALIDE",
};

function getTodayDateTime(): string {
const now = new Date();

const year =
now.getFullYear();

const month = String(
now.getMonth() + 1,
).padStart(2, "0");

const day = String(
now.getDate(),
).padStart(2, "0");

const hours = String(
now.getHours(),
).padStart(2, "0");

const minutes = String(
now.getMinutes(),
).padStart(2, "0");

return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatMoney(
value: number | string | null | undefined,
): string {
if (
value === null ||
value === undefined ||
value === ""
) {
return "0,00";
}

const number = Number(value);

if (Number.isNaN(number)) {
return "0,00";
}

return new Intl.NumberFormat(
"fr-FR",
{
minimumFractionDigits: 2,
maximumFractionDigits: 2,
},
).format(number);
}

function extractBackendError(
error: unknown,
): string {
const axiosError =
error as {
response?: {
data?: unknown;
status?: number;
};
message?: string;
};

const data =
axiosError?.response?.data;

if (!data) {
return (
axiosError?.message ??
"Une erreur est survenue."
);
}

if (typeof data === "string") {
return data;
}

if (
typeof data === "object" &&
data !== null
) {
const record =
data as Record<
string,
unknown
>;


if (
  typeof record.detail ===
  "string"
) {
  return record.detail;
}

const messages: string[] = [];

Object.entries(record).forEach(
  ([field, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        messages.push(
          `${field}: ${
            typeof item ===
            "string"
              ? item
              : JSON.stringify(item)
          }`,
        );
      });

      return;
    }

    if (
      typeof value ===
      "string"
    ) {
      messages.push(
        `${field}: ${value}`,
      );

      return;
    }

    if (
      value !== null &&
      value !== undefined
    ) {
      messages.push(
        `${field}: ${JSON.stringify(
          value,
        )}`,
      );
    }
  },
);

if (messages.length > 0) {
  return messages.join("\n");
}


}

return "Le serveur a refusé l'enregistrement du paiement.";
}

export default function PaymentModal({
isOpen,
onClose,
reservation = null,
reservations = [],
accounts = [],
onSuccess,
}: PaymentModalProps) {
const [form, setForm] =
useState<PaymentFormData>({
...EMPTY_FORM,
});

const [isSubmitting, setIsSubmitting] =
useState(false);

const [errorMessage, setErrorMessage] =
useState("");

const [successMessage, setSuccessMessage] =
useState("");

/**

* =========================================================
* INITIALISATION
* =========================================================
  */
  useEffect(() => {
  if (!isOpen) {
  return;
  }


setErrorMessage("");



setSuccessMessage("");

setForm({
  ...EMPTY_FORM,

  reservation: reservation?.id
    ? String(reservation.id)
    : "",

  payment_date:
    getTodayDateTime(),
});


}, [
isOpen,
reservation,
]);

/**

* =========================================================
* FERMETURE
* =========================================================
  */
  const handleClose = () => {
  if (isSubmitting) {
  return;
  }


setErrorMessage("");



setSuccessMessage("");

onClose();


};

/**

* =========================================================
* MODIFICATION CHAMP
* =========================================================
  */
  const handleChange = (
  field: keyof PaymentFormData,
  value: string,
  ) => {
  setForm((previous) => ({
  ...previous,
  [field]: value,
  }));


if (errorMessage) {



  setErrorMessage("");
}


};

/**

* =========================================================
* RESERVATION SELECTIONNEE
* =========================================================
  */
  const selectedReservation =
  reservations.find(
  (item) =>
  String(item.id) ===
  form.reservation,
  ) ?? reservation;

/**

* =========================================================
* CLIENT
* =========================================================
  */
  const clientName =
  selectedReservation?.client
  ?.full_name ??
  selectedReservation?.client_name ??
  "Client non renseigné";

const clientPhone =
selectedReservation?.client
?.phone ?? "";

/**

* =========================================================
* SOUMISSION
* =========================================================
  */
  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>,
  ) => {
  event.preventDefault();


if (isSubmitting) {



  return;
}

setErrorMessage("");
setSuccessMessage("");

/**
 * Reservation obligatoire
 */
if (!form.reservation) {
  setErrorMessage(
    "Veuillez sélectionner une réservation.",
  );

  return;
}

/**
 * Montant
 */
const amount =
  Number(form.amount);

if (
  !form.amount ||
  Number.isNaN(amount)
) {
  setErrorMessage(
    "Veuillez saisir un montant valide.",
  );

  return;
}

if (amount <= 0) {
  setErrorMessage(
    "Le montant doit être supérieur à zéro.",
  );

  return;
}

/**
 * Date
 */
if (!form.payment_date) {
  setErrorMessage(
    "Veuillez sélectionner la date du paiement.",
  );

  return;
}

/**
 * Référence obligatoire
 * pour virement / Mobile Money
 */
if (
  form.method ===
    "VIREMENT" ||
  form.method ===
    "MOBILE_MONEY"
) {
  if (
    !form.reference.trim()
  ) {
    setErrorMessage(
      "La référence est obligatoire pour un virement ou un paiement Mobile Money.",
    );

    return;
  }
}

/**
 * =======================================================
 * PAYLOAD DJANGO
 * =======================================================
 *
 * UN SEUL POST /payments/
 */
const payload: Record<
  string,
  unknown
> = {
  reservation:
    Number(form.reservation),

  amount:
    amount.toFixed(2),

  payment_date:
    new Date(
      form.payment_date,
    ).toISOString(),

  method:
    form.method,

  reference:
    form.reference.trim() ||
    null,

  operator:
    form.operator.trim() ||
    null,

  financial_account:
    form.financial_account
      ? Number(
          form.financial_account,
        )
      : null,

  status:
    form.status,
};

try {
  setIsSubmitting(true);

  console.log(
    "💰 [POST PAYMENT] Payload envoyé à Django :",
    payload,
  );

  const response =
    await api.post(
      "/payments/",
      payload,
    );

  const backendData =
    response.data;

  console.log(
    "✅ [POST PAYMENT] Paiement enregistré :",
    backendData,
  );

  setSuccessMessage(
    "Paiement enregistré avec succès.",
  );

  /**
   * Le parent recharge la liste.
   */
  onSuccess?.(
    backendData,
  );

  /**
   * Fermeture après succès.
   */
  window.setTimeout(() => {
    onClose();
  }, 500);
} catch (error: unknown) {
  console.error(
    "❌ [POST PAYMENT] Erreur backend :",
    error,
  );

  const message =
    extractBackendError(
      error,
    );

  setErrorMessage(
    message,
  );
} finally {
  setIsSubmitting(false);
}


};

if (!isOpen) {
return null;
}

return (
<div
className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
onMouseDown={(event) => {
if (
event.target ===
event.currentTarget
) {
handleClose();
}
}}
> <div
     className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
     role="dialog"
     aria-modal="true"
     aria-labelledby="payment-modal-title"
   >


    {/* ================================================= */}
    {/* HEADER */}
    {/* ================================================= */}

    <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">

      <div>
        <h2
          id="payment-modal-title"
          className="text-xl font-bold text-white"
        >
          Enregistrer un paiement
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Ajoutez un encaissement lié à une réservation.
        </p>
      </div>

      <button
        type="button"
        onClick={handleClose}
        disabled={isSubmitting}
        className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Fermer"
      >
        ×
      </button>

    </div>

    {/* ================================================= */}
    {/* FORMULAIRE */}
    {/* ================================================= */}

    <form
      onSubmit={handleSubmit}
      className="max-h-[80vh] overflow-y-auto"
    >

      <div className="space-y-5 p-6">

        {/* ================================================= */}
        {/* ERREUR */}
        {/* ================================================= */}

        {errorMessage && (
          <div className="whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

            <div className="font-semibold">
              ❌ Enregistrement impossible
            </div>

            <div className="mt-1">
              {errorMessage}
            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* SUCCÈS */}
        {/* ================================================= */}

        {successMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* ================================================= */}
        {/* RESERVATION */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-reservation"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Réservation

            <span className="ml-1 text-red-400">
              *
            </span>
          </label>

          <select
            id="payment-reservation"
            value={
              form.reservation
            }
            onChange={(event) =>
              handleChange(
                "reservation",
                event.target.value,
              )
            }
            disabled={
              isSubmitting ||
              Boolean(
                reservation?.id,
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <option value="">
              Sélectionner une réservation
            </option>

            {reservations.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.reservation_number ??
                    `Réservation #${item.id}`}
                  {" — "}
                  {item.client
                    ?.full_name ??
                    item.client_name ??
                    "Client non renseigné"}
                </option>
              ),
            )}

          </select>

        </div>

        {/* ================================================= */}
        {/* INFORMATIONS RESERVATION */}
        {/* ================================================= */}

        {selectedReservation && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Réservation
                </p>

                <p className="mt-1 font-semibold text-white">
                  {selectedReservation.reservation_number ??
                    `#${selectedReservation.id}`}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Client
                </p>

                <p className="mt-1 font-semibold text-white">
                  {clientName}
                </p>

                {clientPhone && (
                  <p className="mt-1 text-sm text-slate-400">
                    {clientPhone}
                  </p>
                )}

              </div>

              {(selectedReservation
                .tarif?.amount ??
                selectedReservation
                  .total_amount) !==
                undefined &&
                (selectedReservation
                  .tarif?.amount ??
                  selectedReservation
                    .total_amount) !==
                  null && (
                  <div className="sm:col-span-2">

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Tarif réservation
                    </p>

                    <p className="mt-1 font-semibold text-emerald-400">
                      {formatMoney(
                        selectedReservation
                          .tarif
                          ?.amount ??
                          selectedReservation
                            .total_amount,
                      )}{" "}
                      FCFA
                    </p>

                  </div>
                )}

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* MONTANT */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-amount"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Montant

            <span className="ml-1 text-red-400">
              *
            </span>
          </label>

          <div className="relative">

            <input
              id="payment-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                handleChange(
                  "amount",
                  event.target.value,
                )
              }
              disabled={
                isSubmitting
              }
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-16 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              $
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* MODE DE PAIEMENT */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-method"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Mode de paiement

            <span className="ml-1 text-red-400">
              *
            </span>
          </label>

          <select
            id="payment-method"
            value={
              form.method
            }
            onChange={(event) =>
              handleChange(
                "method",
                event.target
                  .value,
              )
            }
            disabled={
              isSubmitting
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <option value="ESPECES">
              Espèces
            </option>

            <option value="VIREMENT">
              Virement bancaire
            </option>

            <option value="MOBILE_MONEY">
              Mobile Money
            </option>

          </select>

        </div>

        {/* ================================================= */}
        {/* COMPTE FINANCIER */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-account"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Compte financier

            <span className="ml-2 text-xs font-normal text-slate-500">
              facultatif
            </span>
          </label>

          <select
            id="payment-account"
            value={
              form.financial_account
            }
            onChange={(event) =>
              handleChange(
                "financial_account",
                event.target
                  .value,
              )
            }
            disabled={
              isSubmitting
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <option value="">
              Aucun compte sélectionné
            </option>

            {accounts
              .filter(
                (account) =>
                  account.is_active !==
                  false,
              )
              .map(
                (account) => (
                  <option
                    key={
                      account.id
                    }
                    value={
                      account.id
                    }
                  >
                    {account.name}

                    {account.account_type
                      ? ` — ${account.account_type}`
                      : ""}

                    {account.balance !==
                      undefined &&
                    account.balance !==
                      null
                      ? ` — ${formatMoney(
                          account.balance,
                        )} FCFA`
                      : ""}
                  </option>
                ),
              )}

          </select>

          <p className="mt-1 text-xs text-slate-500">
            Le compte peut rester vide. Le backend reste responsable de la gestion financière.
          </p>

        </div>

        {/* ================================================= */}
        {/* DATE */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-date"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Date du paiement

            <span className="ml-1 text-red-400">
              *
            </span>
          </label>

          <input
            id="payment-date"
            type="datetime-local"
            value={
              form.payment_date
            }
            onChange={(event) =>
              handleChange(
                "payment_date",
                event.target
                  .value,
              )
            }
            disabled={
              isSubmitting
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

        </div>

        {/* ================================================= */}
        {/* REFERENCE */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-reference"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Référence

            {(form.method ===
              "VIREMENT" ||
              form.method ===
                "MOBILE_MONEY") && (
              <span className="ml-1 text-red-400">
                *
              </span>
            )}

          </label>

          <input
            id="payment-reference"
            type="text"
            value={
              form.reference
            }
            onChange={(event) =>
              handleChange(
                "reference",
                event.target
                  .value,
              )
            }
            disabled={
              isSubmitting
            }
            placeholder={
              form.method ===
              "MOBILE_MONEY"
                ? "Référence Mobile Money"
                : form.method ===
                    "VIREMENT"
                  ? "Référence du virement"
                  : "Référence éventuelle"
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

        </div>

        {/* ================================================= */}
        {/* OPERATEUR */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-operator"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Opérateur

            <span className="ml-2 text-xs font-normal text-slate-500">
              facultatif
            </span>
          </label>

          <input
            id="payment-operator"
            type="text"
            value={
              form.operator
            }
            onChange={(event) =>
              handleChange(
                "operator",
                event.target
                  .value,
              )
            }
            disabled={
              isSubmitting
            }
            placeholder="Nom de l'opérateur"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

        </div>

        {/* ================================================= */}
        {/* STATUT */}
        {/* ================================================= */}

        <div>

          <label
            htmlFor="payment-status"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Statut
          </label>

          <select
            id="payment-status"
            value={
              form.status
            }
            onChange={(event) =>
              handleChange(
                "status",
                event.target
                  .value,
              )
            }
            disabled={
              isSubmitting
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <option value="VALIDE">
              Validé
            </option>

            <option value="EN_ATTENTE">
              En attente
            </option>

          </select>

        </div>

      </div>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-700 bg-slate-950/50 px-6 py-4 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={handleClose}
          disabled={
            isSubmitting
          }
          className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">

              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

              Enregistrement...

            </span>
          ) : (
            "Enregistrer le paiement"
          )}

        </button>

      </div>

    </form>

  </div>
</div>

);
}
