"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

/* ============================================================
   TYPES
============================================================ */

export interface RefundPayment {
  id: number;
  reservation?: number | null;
  reservation_number?: string | null;
  client_name?: string | null;
  client_full_name?: string | null;

  amount: string | number;

  method?: string | null;
  financial_account?: number | null;

  status?: string | null;

  refunded_amount?: string | number;
  refundable_amount?: string | number;
  already_refunded?: string | number;
}

interface RefundModalProps {
  open: boolean;
  payment: RefundPayment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ============================================================
   ERROR
============================================================ */

function getBackendError(error: unknown): string {
  const axiosError = error as {
    response?: {
      data?: unknown;
    };
    message?: string;
  };

  const data = axiosError?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const values = Object.entries(data as Record<string, unknown>)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }

        if (typeof value === "object" && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        }

        return `${key}: ${String(value)}`;
      })
      .join("\n");

    if (values) {
      return values;
    }
  }

  return axiosError?.message || "Une erreur est survenue.";
}

/* ============================================================
   COMPONENT
============================================================ */

export default function RefundModal({
  open,
  payment,
  onClose,
  onSuccess,
}: RefundModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("ESPECES");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ============================================================
     INITIALISATION
  ============================================================ */

  useEffect(() => {
    if (!open || !payment) {
      return;
    }

    setError("");

    const refundable =
      payment.refundable_amount !== undefined
        ? Number(payment.refundable_amount)
        : Math.max(
            Number(payment.amount || 0) -
              Number(payment.already_refunded || 0),
            0,
          );

    setAmount(refundable > 0 ? refundable.toFixed(2) : "");
    setMethod(payment.method || "ESPECES");
    setReason("");
    setReference("");
  }, [open, payment]);

  if (!open || !payment) {
    return null;
  }

  /* ============================================================
     MONTANT REMBOURSABLE
  ============================================================ */

  const paymentAmount = Number(payment.amount || 0);

  const alreadyRefunded =
    payment.already_refunded !== undefined
      ? Number(payment.already_refunded)
      : Number(payment.refunded_amount || 0);

  const refundableAmount =
    payment.refundable_amount !== undefined
      ? Number(payment.refundable_amount)
      : Math.max(paymentAmount - alreadyRefunded, 0);

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const refundAmount = Number(amount);

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      setError(
        "Le montant du remboursement doit être supérieur à zéro.",
      );
      return;
    }

    if (refundAmount > refundableAmount) {
      setError(
        `Le remboursement ne peut pas dépasser ${refundableAmount.toFixed(
          2,
        )} $.`,
      );
      return;
    }

    if (!payment.reservation) {
      setError(
        "Ce paiement n'est associé à aucune réservation.",
      );
      return;
    }

    if (!payment.financial_account) {
      setError(
        "Ce paiement n'est associé à aucun compte financier.",
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(API_ROUTES.REFUNDS, {
        payment: payment.id,
        reservation: payment.reservation,
        financial_account: payment.financial_account,
        amount: refundAmount,
        refund_date: new Date()
          .toISOString()
          .slice(0, 10),
        method,
        reason: reason.trim(),
        reference: reference.trim(),
      });

      onSuccess?.();
      onClose();
    } catch (submitError) {
      setError(getBackendError(submitError));
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Rembourser le paiement
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Le paiement restera dans l'historique.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="whitespace-pre-line rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* PAIEMENT */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">
                  Paiement
                </p>

                <p className="mt-1 font-semibold text-white">
                  #{payment.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Réservation
                </p>

                <p className="mt-1 font-semibold text-white">
                  {payment.reservation_number ||
                    (payment.reservation
                      ? `#${payment.reservation}`
                      : "—")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Client
                </p>

                <p className="mt-1 font-semibold text-white">
                  {payment.client_full_name ||
                    payment.client_name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Paiement initial
                </p>

                <p className="mt-1 font-semibold text-white">
                  {paymentAmount.toFixed(2)} $
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Déjà remboursé
                </p>

                <p className="mt-1 font-semibold text-orange-400">
                  {alreadyRefunded.toFixed(2)} $
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Remboursable
                </p>

                <p className="mt-1 font-semibold text-green-400">
                  {refundableAmount.toFixed(2)} $
                </p>
              </div>
            </div>
          </div>

          {/* MONTANT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Montant à rembourser
            </label>

            <input
              type="number"
              min="0.01"
              max={refundableAmount}
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* METHODE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Méthode de remboursement
            </label>

            <select
              value={method}
              onChange={(event) => {
                setMethod(event.target.value);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="ESPECES">Espèces</option>
              <option value="VIREMENT">
                Virement bancaire
              </option>
              <option value="MOBILE_MONEY">
                Mobile Money
              </option>
            </select>
          </div>

          {/* REFERENCE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Référence
            </label>

            <input
              type="text"
              value={reference}
              onChange={(event) => {
                setReference(event.target.value);
              }}
              placeholder="Référence du remboursement"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </div>

          {/* MOTIF */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Motif
            </label>

            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
              }}
              rows={3}
              placeholder="Motif du remboursement..."
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={
                loading || refundableAmount <= 0
              }
              className="flex items-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="mr-2 animate-spin"
                />
              )}

              Confirmer le remboursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}