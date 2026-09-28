"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export interface RefundPayment {
  id: number;

  reservation: number | null;
  reservation_number: string | null;

  client_name: string | null;

  amount: string | number;

  method: string;
  method_display?: string;

  financial_account: number | null;
  account_name?: string | null;

  status: string;
}

interface RefundModalProps {
  payment: RefundPayment | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface RefundForm {
  amount: string;
  reason: string;
}

const INITIAL_FORM: RefundForm = {
  amount: "",
  reason: "",
};

function getErrorMessage(error: unknown): string {

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {

    const response = (
      error as {
        response?: {
          data?: unknown;
        };
      }
    ).response;

    const data = response?.data;

    if (
      typeof data === "object" &&
      data !== null
    ) {

      const detail = (
        data as {
          detail?: unknown;
        }
      ).detail;

      if (typeof detail === "string") {
        return detail;
      }

      const amount = (
        data as {
          amount?: unknown;
        }
      ).amount;

      if (Array.isArray(amount)) {
        return String(amount[0]);
      }

      if (typeof amount === "string") {
        return amount;
      }
    }
  }

  return "Impossible d'effectuer le remboursement.";
}

export default function RefundModal({
  payment,
  onClose,
  onSuccess,
}: RefundModalProps) {

  const [form, setForm] = useState<RefundForm>(
    INITIAL_FORM
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [maxRefundable, setMaxRefundable] = useState(0);

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useEffect(() => {

    if (!payment) {
      return;
    }

    setForm({
      amount: "",
      reason: "",
    });

    setError("");

    setMaxRefundable(
      Number(payment.amount) || 0
    );

  }, [payment]);

  if (!payment) {
    return null;
  }

  const paymentAmount =
    Number(payment.amount) || 0;

  const method =
    payment.method;

  const methodLabel =
    payment.method_display ||
    method;

  // ==========================================================
  // SOUMISSION
  // ==========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError("");

    const amount = Number(
      form.amount.replace(",", ".")
    );

    if (!Number.isFinite(amount) || amount <= 0) {

      setError(
        "Veuillez saisir un montant valide."
      );

      return;
    }

    if (amount > maxRefundable) {

      setError(
        `Le montant maximum remboursable est de ${maxRefundable.toLocaleString(
          "fr-FR"
        )} $.`
      );

      return;
    }

    try {

      setLoading(true);

      await api.post(
        API_ROUTES.REFUNDS,
        {
          payment: payment.id,
          amount: amount.toFixed(2),
          method,
          reason: form.reason.trim() || null,
        }
      );

      onSuccess();

      onClose();

    } catch (error) {

      console.error(
        "❌ [POST REFUND] Erreur backend :",
        error
      );

      setError(
        getErrorMessage(error)
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">

              <RotateCcw className="h-5 w-5 text-amber-400" />

            </div>

            <div>

              <h2 className="text-lg font-bold text-white">
                Effectuer un remboursement
              </h2>

              <p className="text-sm text-slate-400">
                {payment.reservation_number ||
                  "Paiement sans réservation"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* ==================================================
            CONTENU
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* Client */}

          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Client
            </p>

            <p className="mt-1 font-semibold text-white">
              {payment.client_name || "—"}
            </p>

          </div>

          {/* Informations paiement */}

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">

              <p className="text-xs text-slate-500">
                Paiement initial
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {paymentAmount.toLocaleString("fr-FR")} $
              </p>

            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">

              <p className="text-xs text-slate-500">
                Maximum remboursable
              </p>

              <p className="mt-1 text-lg font-bold text-amber-400">
                {maxRefundable.toLocaleString("fr-FR")} $
              </p>

            </div>

          </div>

          {/* Mode */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Mode de remboursement
            </label>

            <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">

              <p className="font-medium text-white">
                {methodLabel}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Même mode que le paiement original
              </p>

            </div>

          </div>

          {/* Montant */}

          <div>

            <label
              htmlFor="refund-amount"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Montant à rembourser
            </label>

            <input
              id="refund-amount"
              type="number"
              min="0.01"
              max={maxRefundable}
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  amount: event.target.value,
                }))
              }
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-amber-500"
              placeholder="0.00"
            />

            <p className="mt-1 text-xs text-slate-500">
              Maximum autorisé :{" "}
              {maxRefundable.toLocaleString("fr-FR")} $
            </p>

          </div>

          {/* Motif */}

          <div>

            <label
              htmlFor="refund-reason"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Motif du remboursement
            </label>

            <textarea
              id="refund-reason"
              rows={3}
              value={form.reason}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  reason: event.target.value,
                }))
              }
              disabled={loading}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-amber-500"
              placeholder="Motif du remboursement..."
            />

          </div>

          {/* Erreur */}

          {error && (

            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">

              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <span>
                {error}
              </span>

            </div>

          )}

          {/* Actions */}

          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                maxRefundable <= 0
              }
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Remboursement...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Rembourser
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}