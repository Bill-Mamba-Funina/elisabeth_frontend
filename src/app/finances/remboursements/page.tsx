"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

import RefundModal, {
  RefundPayment,
} from "@/components/paiements/RefundModal";

interface Payment {
  id: number;

  reservation: number | null;
  reservation_number?: string | null;

  client_name?: string | null;

  amount: string | number;

  method: string;
  method_display?: string;

  financial_account: number | null;
  account_name?: string | null;

  status: string;
}

interface Refund {
  id: number;

  payment: number;

  amount: string | number;

  status: string;
}

function parseList<T>(data: unknown): T[] {

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray(
      (data as { results?: unknown }).results
    )
  ) {
    return (
      (data as { results: T[] }).results
    );
  }

  return [];
}

export default function RemboursementsPage() {

  const [payments, setPayments] = useState<Payment[]>([]);

  const [refunds, setRefunds] = useState<Refund[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState<RefundPayment | null>(null);

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  const loadData = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const [
        paymentsResponse,
        refundsResponse,
      ] = await Promise.all([
        api.get(API_ROUTES.PAYMENTS),
        api.get(API_ROUTES.REFUNDS),
      ]);

      setPayments(
        parseList<Payment>(
          paymentsResponse.data
        )
      );

      setRefunds(
        parseList<Refund>(
          refundsResponse.data
        )
      );

    } catch (error) {

      console.error(
        "❌ [REFUNDS] Erreur chargement :",
        error
      );

      setError(
        "Impossible de charger les remboursements."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    loadData();

  }, [loadData]);

  // ==========================================================
  // CALCUL DES PAIEMENTS REMBOURSABLES
  // ==========================================================

  const refundablePayments = useMemo(() => {

    return payments
      .filter(
        (payment) =>
          payment.status === "VALIDE" &&
          payment.reservation !== null &&
          payment.financial_account !== null
      )
      .map((payment) => {

        const refunded = refunds
          .filter(
            (refund) =>
              refund.payment === payment.id &&
              refund.status === "VALIDE"
          )
          .reduce(
            (total, refund) =>
              total + Number(refund.amount),
            0
          );

        const refundableAmount =
          Number(payment.amount) - refunded;

        return {
          ...payment,
          refunded,
          refundableAmount,
        };

      })
      .filter(
        (payment) =>
          payment.refundableAmount > 0
      );

  }, [payments, refunds]);

  // ==========================================================
  // FILTRE
  // ==========================================================

  const filteredPayments =
    refundablePayments.filter(
      (payment) => {

        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          payment.reservation_number
            ?.toLowerCase()
            .includes(query) ||
          payment.client_name
            ?.toLowerCase()
            .includes(query)
        );

      }
    );

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const totalRefundable =
    refundablePayments.reduce(
      (total, payment) =>
        total + payment.refundableAmount,
      0
    );

  const totalAlreadyRefunded =
    refunds
      .filter(
        (refund) =>
          refund.status === "VALIDE"
      )
      .reduce(
        (total, refund) =>
          total + Number(refund.amount),
        0
      );

  // ==========================================================
  // OUVRIR MODAL
  // ==========================================================

  const openRefundModal = (
    payment: typeof refundablePayments[number]
  ) => {

    setSelectedPayment({
      id: payment.id,

      reservation:
        payment.reservation,

      reservation_number:
        payment.reservation_number || null,

      client_name:
        payment.client_name || null,

      amount:
        payment.amount,

      method:
        payment.method,

      method_display:
        payment.method_display,

      financial_account:
        payment.financial_account,

      account_name:
        payment.account_name,

      status:
        payment.status,
    });

  };

  return (
    <section className="space-y-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-2xl font-bold text-white">
            Remboursements
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Gérez les remboursements des paiements validés.
          </p>

        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >

          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Actualiser

        </button>

      </div>

      {/* ====================================================
          STATISTIQUES
      ==================================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Paiements remboursables
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {refundablePayments.length}
          </p>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Montant remboursable
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {totalRefundable.toLocaleString("fr-FR")} $
          </p>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Total déjà remboursé
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {totalAlreadyRefunded.toLocaleString("fr-FR")} $
          </p>

        </div>

      </div>

      {/* ====================================================
          RECHERCHE
      ==================================================== */}

      <div className="relative">

        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Rechercher par réservation ou client..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none transition focus:border-amber-500"
        />

      </div>

      {/* ====================================================
          ERREUR
      ==================================================== */}

      {error && (

        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

          <AlertCircle className="h-5 w-5" />

          {error}

        </div>

      )}

      {/* ====================================================
          TABLEAU
      ==================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

        {loading ? (

          <div className="flex items-center justify-center gap-3 p-12 text-slate-400">

            <Loader2 className="h-5 w-5 animate-spin" />

            Chargement des paiements remboursables...

          </div>

        ) : filteredPayments.length === 0 ? (

          <div className="flex flex-col items-center justify-center p-12 text-center">

            <RotateCcw className="h-10 w-10 text-slate-600" />

            <p className="mt-4 font-medium text-white">
              Aucun paiement remboursable
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Tous les paiements validés ont déjà été
              entièrement remboursés ou aucun paiement
              n'est disponible.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-slate-800 bg-slate-950">

                <tr>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    #
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Réservation
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Client
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Paiement
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Déjà remboursé
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Remboursable
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Compte
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {filteredPayments.map(
                  (payment, index) => (

                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-800/50"
                    >

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-semibold text-white">
                          {payment.reservation_number ||
                            "—"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {payment.client_name || "—"}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-white">

                        {Number(
                          payment.amount
                        ).toLocaleString(
                          "fr-FR"
                        )} $

                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-400">

                        {payment.refunded.toLocaleString(
                          "fr-FR"
                        )} $

                      </td>

                      <td className="px-5 py-4 text-right font-bold text-amber-400">

                        {payment.refundableAmount.toLocaleString(
                          "fr-FR"
                        )} $

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">

                        {payment.account_name ||
                          "—"}

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openRefundModal(
                              payment
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-500"
                        >

                          <RotateCcw className="h-4 w-4" />

                          Rembourser

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ====================================================
          MODAL
      ==================================================== */}

      <RefundModal
        payment={selectedPayment}
        onClose={() =>
          setSelectedPayment(null)
        }
        onSuccess={() => {
          setSelectedPayment(null);
          loadData();
        }}
      />

    </section>
  );
}