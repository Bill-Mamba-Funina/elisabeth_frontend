"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  Calendar,
  User,
  DollarSign,
  Info,
} from "lucide-react";
import axios from "axios";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Reservation {
  id: number | string;

  reference?: string;
  reservation_number?: string;

  client_name?: string;

  client?: {
    full_name?: string;
  };

  total_amount?: number | string;
  total_price?: number | string;
  montant_total?: number | string;

  paid_amount?: number | string;
  remaining_amount?: number | string;

  start_date?: string;
  end_date?: string;

  date_debut?: string;
  date_fin?: string;

  status?: string;
  statut?: string;
}

interface FinancialAccount {
  id: number | string;
  name?: string;
  account_type?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onSuccess: () => void;
}

type PaymentMethod =
  | "ESPECES"
  | "VIREMENT"
  | "MOBILE_MONEY";

type PaymentStatus =
  | "EN_ATTENTE"
  | "VALIDE"
  | "ANNULE";

interface PaymentPayload {
  reservation: number | string;
  financial_account?: number | string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  operator?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  reservations,
  onSuccess,
}: PaymentModalProps) {
  const [selectedReservationId, setSelectedReservationId] =
    useState("");

  const [defaultAccountId, setDefaultAccountId] =
    useState<number | string | null>(null);

  const [amount, setAmount] = useState("");

  const [method, setMethod] =
    useState<PaymentMethod>("ESPECES");

  const [status, setStatus] =
    useState<PaymentStatus>("VALIDE");

  const [reference, setReference] = useState("");

  const [operator, setOperator] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [loadingAccount, setLoadingAccount] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * ============================================================
   * RÉSERVATION SÉLECTIONNÉE
   * ============================================================
   */

  const selectedReservation =
    reservations.find(
      (reservation) =>
        String(reservation.id) ===
        String(selectedReservationId)
    ) ?? null;

  /*
   * ============================================================
   * RÉCUPÉRATION DU COMPTE FINANCIER
   * ============================================================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    async function fetchDefaultAccount() {
      try {
        setLoadingAccount(true);

        const response = await api.get(
          API_ROUTES.ACCOUNTS
        );

        const data = response.data;

        const accounts: FinancialAccount[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : [];

        if (
          !cancelled &&
          accounts.length > 0
        ) {
          setDefaultAccountId(
            accounts[0].id
          );
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.warn(
            "Impossible de récupérer le compte financier :",
            err.response?.data
          );
        } else {
          console.warn(
            "Impossible de récupérer le compte financier :",
            err
          );
        }

        /*
         * Le compte financier étant nullable dans ton modèle,
         * on peut continuer sans compte si Django l'autorise.
         */
        if (!cancelled) {
          setDefaultAccountId(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingAccount(false);
        }
      }
    }

    fetchDefaultAccount();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  /*
   * ============================================================
   * CHANGEMENT DE RÉSERVATION
   * ============================================================
   */

  const handleReservationChange = (
    id: string
  ) => {
    setSelectedReservationId(id);
    setError("");

    const reservation =
      reservations.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!reservation) {
      setAmount("");
      return;
    }

    const total = Number(
      reservation.total_amount ??
        reservation.total_price ??
        reservation.montant_total ??
        0
    );

    const paid = Number(
      reservation.paid_amount ?? 0
    );

    /*
     * Si le backend fournit remaining_amount,
     * on l'utilise en priorité.
     *
     * Sinon :
     * reste = total - déjà payé
     */
    const remaining =
      reservation.remaining_amount !==
      undefined
        ? Number(
            reservation.remaining_amount
          )
        : Math.max(0, total - paid);

    setAmount(
      Math.max(0, remaining).toFixed(2)
    );
  };

  /*
   * ============================================================
   * FERMETURE / RESET
   * ============================================================
   */

  const resetForm = () => {
    setSelectedReservationId("");
    setAmount("");
    setMethod("ESPECES");
    setStatus("VALIDE");
    setReference("");
    setOperator("");
    setError("");
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  };

  /*
   * ============================================================
   * SOUMISSION DU PAIEMENT
   * ============================================================
   */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    /*
     * Vérification réservation
     */
    if (!selectedReservationId) {
      setError(
        "Veuillez sélectionner une réservation."
      );
      return;
    }

    /*
     * Vérification montant
     */
    const amountNumber = Number(amount);

    if (
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0
    ) {
      setError(
        "Veuillez saisir un montant valide supérieur à zéro."
      );
      return;
    }

    /*
     * Vérification réservation sélectionnée
     */
    if (!selectedReservation) {
      setError(
        "La réservation sélectionnée est introuvable."
      );
      return;
    }

    /*
     * Calcul du reste à payer
     */
    const total = Number(
      selectedReservation.total_amount ??
        selectedReservation.total_price ??
        selectedReservation.montant_total ??
        0
    );

    const paid = Number(
      selectedReservation.paid_amount ?? 0
    );

    const remaining =
      selectedReservation.remaining_amount !==
      undefined
        ? Number(
            selectedReservation.remaining_amount
          )
        : Math.max(0, total - paid);

    /*
     * Le paiement ne doit pas dépasser le reste.
     */
    if (
      remaining > 0 &&
      amountNumber > remaining
    ) {
      setError(
        `Le paiement ne peut pas dépasser le reste à payer de ${remaining.toLocaleString(
          "fr-FR"
        )} $.`
      );
      return;
    }

    /*
     * Conversion de l'ID réservation
     */
    const reservationIdNumber = Number(
      selectedReservationId
    );

    const reservationId: number | string =
      Number.isInteger(reservationIdNumber)
        ? reservationIdNumber
        : selectedReservationId;

    /*
     * ========================================================
     * PAYLOAD DJANGO
     * ========================================================
     */

    const payload: PaymentPayload = {
      reservation: reservationId,
      amount: Number(
        amountNumber.toFixed(2)
      ),
      method,
      status,
    };

    /*
     * Le compte financier est facultatif.
     */
    if (
      defaultAccountId !== null &&
      defaultAccountId !== undefined
    ) {
      const accountIdNumber = Number(
        defaultAccountId
      );

      payload.financial_account =
        Number.isInteger(accountIdNumber)
          ? accountIdNumber
          : defaultAccountId;
    }

    /*
     * Référence facultative
     */
    if (reference.trim()) {
      payload.reference =
        reference.trim();
    }

    /*
     * Opérateur facultatif
     */
    if (operator.trim()) {
      payload.operator =
        operator.trim();
    }

    try {
      setSubmitting(true);

      console.log(
        "📤 [POST PAYMENT] Payload :",
        payload
      );

      const response = await api.post(
        API_ROUTES.PAYMENTS,
        payload
      );

      console.log(
        "✅ [POST PAYMENT] Succès :",
        response.status,
        response.data
      );

      resetForm();

      /*
       * Actualiser le tableau des paiements
       * et les réservations.
       */
      onSuccess();

      onClose();
    } catch (err: unknown) {
      console.error(
        "❌ [POST PAYMENT] Erreur backend :",
        err
      );

      /*
       * Erreur Axios
       */
      if (axios.isAxiosError(err)) {
        const backendData =
          err.response?.data;

        console.error(
          "❌ [POST PAYMENT] Réponse Django :",
          backendData
        );

        if (
          backendData &&
          typeof backendData === "object"
        ) {
          const messages =
            Object.entries(
              backendData as Record<
                string,
                unknown
              >
            )
              .map(
                ([key, value]) => {
                  if (
                    Array.isArray(value)
                  ) {
                    return `${key} : ${value.join(
                      ", "
                    )}`;
                  }

                  if (
                    typeof value ===
                    "object" &&
                    value !== null
                  ) {
                    return `${key} : ${JSON.stringify(
                      value
                    )}`;
                  }

                  return `${key} : ${String(
                    value
                  )}`;
                }
              )
              .join(" | ");

          setError(
            messages ||
              "Impossible d'enregistrer le paiement."
          );
        } else if (
          typeof backendData === "string"
        ) {
          setError(backendData);
        } else {
          setError(
            err.message ||
              "Erreur lors de l'enregistrement du paiement."
          );
        }
      } else {
        /*
         * Erreur JavaScript classique
         */
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue lors de l'enregistrement du paiement."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ============================================================
   * MODAL FERMÉE
   * ============================================================
   */

  if (!isOpen) {
    return null;
  }

  /*
   * ============================================================
   * AFFICHAGE
   * ============================================================
   */

  const selectedTotal = selectedReservation
    ? Number(
        selectedReservation.total_amount ??
          selectedReservation.total_price ??
          selectedReservation.montant_total ??
          0
      )
    : 0;

  const selectedPaid = selectedReservation
    ? Number(
        selectedReservation.paid_amount ?? 0
      )
    : 0;

  const selectedRemaining =
    selectedReservation
      ? selectedReservation.remaining_amount !==
        undefined
        ? Number(
            selectedReservation.remaining_amount
          )
        : Math.max(
            0,
            selectedTotal - selectedPaid
          )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Nouveau paiement
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Enregistrer un paiement lié à une
              réservation
            </p>
          </div>

          <button
            onClick={handleClose}
            type="button"
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================= */}
        {/* ERREUR */}
        {/* ================================================= */}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/80 p-3 text-xs text-red-300">
            <strong>Erreur :</strong>{" "}
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* FORMULAIRE */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
        >

          {/* ================================================= */}
          {/* RÉSERVATION */}
          {/* ================================================= */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Réservation *
            </label>

            <select
              value={selectedReservationId}
              onChange={(event) =>
                handleReservationChange(
                  event.target.value
                )
              }
              required
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">
                -- Choisir une réservation --
              </option>

              {reservations.map(
                (reservation) => {
                  const clientName =
                    reservation.client_name ||
                    reservation.client
                      ?.full_name ||
                    "";

                  const reference =
                    reservation.reservation_number ||
                    reservation.reference ||
                    `#${reservation.id}`;

                  return (
                    <option
                      key={reservation.id}
                      value={reservation.id}
                    >
                      {reference}
                      {clientName
                        ? ` - ${clientName}`
                        : ""}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          {/* ================================================= */}
          {/* RÉCAPITULATIF */}
          {/* ================================================= */}

          {selectedReservation && (
            <div className="space-y-3 rounded-xl border border-blue-500/30 bg-blue-950/30 p-4 text-sm text-slate-200">

              <div className="flex items-center gap-2 border-b border-blue-900/50 pb-2 font-bold text-blue-400">
                <Info className="h-4 w-4" />

                <span>
                  Réservation{" "}
                  {selectedReservation.reservation_number ||
                    selectedReservation.reference ||
                    `#${selectedReservation.id}`}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* CLIENT */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-slate-400" />

                  <div>
                    <span className="block text-xs text-slate-400">
                      Client
                    </span>

                    <span className="font-semibold text-white">
                      {selectedReservation.client_name ||
                        selectedReservation.client
                          ?.full_name ||
                        "Non spécifié"}
                    </span>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 shrink-0 text-emerald-400" />

                  <div>
                    <span className="block text-xs text-slate-400">
                      Total réservation
                    </span>

                    <span className="font-bold text-emerald-400">
                      {selectedTotal.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      $
                    </span>
                  </div>
                </div>

                {/* DÉJÀ PAYÉ */}
                <div>
                  <span className="block text-xs text-slate-400">
                    Déjà payé
                  </span>

                  <span className="font-semibold text-blue-300">
                    {selectedPaid.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    $
                  </span>
                </div>

                {/* RESTE */}
                <div>
                  <span className="block text-xs text-slate-400">
                    Reste à payer
                  </span>

                  <span
                    className={`font-bold ${
                      selectedRemaining >
                      0
                        ? "text-amber-400"
                        : "text-green-400"
                    }`}
                  >
                    {selectedRemaining.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    $
                  </span>
                </div>

                {/* DATES */}
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />

                  <div>
                    <span className="block text-xs text-slate-400">
                      Dates
                    </span>

                    <span className="text-xs text-slate-200">
                      {selectedReservation.start_date ||
                        selectedReservation.date_debut ||
                        "-"}{" "}
                      ➔{" "}
                      {selectedReservation.end_date ||
                        selectedReservation.date_fin ||
                        "-"}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* MODE DE PAIEMENT */}
          {/* ================================================= */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Mode de paiement *
            </label>

            <select
              value={method}
              onChange={(event) =>
                setMethod(
                  event.target
                    .value as PaymentMethod
                )
              }
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Compte financier
            </label>

            <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300">
              {loadingAccount
                ? "Recherche du compte..."
                : defaultAccountId !== null
                  ? `Compte #${defaultAccountId}`
                  : "Aucun compte sélectionné"}
            </div>
          </div>

          {/* ================================================= */}
          {/* MONTANT */}
          {/* ================================================= */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Montant ($) *
            </label>

            <input
              type="number"
              min="0.01"
              max={
                selectedRemaining > 0
                  ? selectedRemaining
                  : undefined
              }
              step="0.01"
              placeholder="Ex : 250"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              required
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            />

            {selectedReservation &&
              selectedRemaining > 0 && (
                <p className="mt-1 text-xs text-slate-400">
                  Maximum autorisé :{" "}
                  {selectedRemaining.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  $
                </p>
              )}
          </div>

          {/* ================================================= */}
          {/* RÉFÉRENCE + OPÉRATEUR */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Référence
              </label>

              <input
                type="text"
                placeholder="Ex : TXN-12345"
                value={reference}
                onChange={(event) =>
                  setReference(
                    event.target.value
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Opérateur
              </label>

              <input
                type="text"
                placeholder="Ex : M-Pesa, Orange"
                value={operator}
                onChange={(event) =>
                  setOperator(
                    event.target.value
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
              />
            </div>

          </div>

          {/* ================================================= */}
          {/* STATUT */}
          {/* ================================================= */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Statut du paiement *
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as PaymentStatus
                )
              }
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            >
              <option value="VALIDE">
                Validé
              </option>

              <option value="EN_ATTENTE">
                En attente
              </option>

              <option value="ANNULE">
                Annulé
              </option>
            </select>
          </div>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !selectedReservationId ||
                !amount
              }
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {submitting
                ? "Enregistrement..."
                : "Enregistrer le paiement"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
