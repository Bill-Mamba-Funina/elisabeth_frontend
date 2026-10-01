"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

/* ============================================================
   TYPES
============================================================ */

export interface PaymentReservation {
  id: number;
  reservation_number?: string;
  client_full_name?: string;
  client_name?: string;

  total_amount?: string | number;

  /**
   * Montant brut des paiements validés.
   */
  paid_amount?: string | number;

  /**
   * Montant total déjà remboursé.
   */
  refunded_amount?: string | number;

  /**
   * Montant net réellement payé après remboursements.
   */
  net_paid_amount?: string | number;

  /**
   * Reste à payer après remboursements.
   */
  remaining_amount?: string | number;

  payment_status?: string;
}

export interface PaymentAccount {
  id: number;
  name: string;
  account_type?: string;
  balance?: string | number;
  is_active?: boolean;
}

export interface PaymentFormData {
  reservation: number | null;
  financial_account: number | null;
  amount: string;
  method: string;
  reference: string;
  operator: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reservation?: PaymentReservation | null;
  reservations?: PaymentReservation[];
  accounts?: PaymentAccount[];
}

/* ============================================================
   HELPERS
============================================================ */

function extractList<T>(responseData: unknown): T[] {
  if (Array.isArray(responseData)) {
    return responseData as T[];
  }

  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "results" in responseData
  ) {
    const results = (responseData as { results?: unknown }).results;

    if (Array.isArray(results)) {
      return results as T[];
    }
  }

  return [];
}

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

function getTotalAmount(
  reservation: PaymentReservation | null | undefined,
): number {
  return Number(reservation?.total_amount ?? 0);
}

function getPaidAmount(
  reservation: PaymentReservation | null | undefined,
): number {
  return Number(
    reservation?.net_paid_amount ??
      reservation?.paid_amount ??
      0,
  );
}

function getRefundedAmount(
  reservation: PaymentReservation | null | undefined,
): number {
  return Number(reservation?.refunded_amount ?? 0);
}

function getRemainingAmount(
  reservation: PaymentReservation | null | undefined,
): number {
  if (!reservation) {
    return 0;
  }

  /*
   * Le backend peut déjà fournir remaining_amount.
   * On le privilégie car il représente la valeur officielle.
   */
  if (
    reservation.remaining_amount !== undefined &&
    reservation.remaining_amount !== null
  ) {
    return Math.max(
      Number(reservation.remaining_amount),
      0,
    );
  }

  /*
   * Sinon :
   *
   * total
   * - paiements nets
   * = reste
   */
  const total = getTotalAmount(reservation);
  const paid = getPaidAmount(reservation);

  return Math.max(total - paid, 0);
}

/* ============================================================
   COMPONENT
============================================================ */

export default function PaymentModal({
  open,
  onClose,
  onSuccess,
  reservation,
  reservations = [],
  accounts = [],
}: PaymentModalProps) {
  const [localReservations, setLocalReservations] =
    useState<PaymentReservation[]>(reservations);

  const [localAccounts, setLocalAccounts] =
    useState<PaymentAccount[]>(accounts);

  const [form, setForm] = useState<PaymentFormData>({
    reservation: reservation?.id ?? null,
    financial_account: null,
    amount: "",
    method: "ESPECES",
    reference: "",
    operator: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  /* ============================================================
     CHARGEMENT
  ============================================================ */

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    setForm((previous) => ({
      ...previous,
      reservation:
        reservation?.id ??
        previous.reservation,
      amount:
        reservation
          ? getRemainingAmount(reservation).toFixed(2)
          : previous.amount,
    }));

    const loadData = async () => {
      try {
        setLoadingData(true);

        /*
         * RESERVATIONS
         */
        if (reservations.length === 0) {
          const reservationResponse =
            await api.get(
              API_ROUTES.RESERVATIONS,
              {
                params: {
                  page_size: 1000,
                },
              },
            );

          setLocalReservations(
            extractList<PaymentReservation>(
              reservationResponse.data,
            ),
          );
        } else {
          setLocalReservations(reservations);
        }

        /*
         * COMPTES FINANCIERS
         *
         * IMPORTANT :
         * on utilise FINANCIAL_ACCOUNTS,
         * pas ACCOUNTS.
         */
        if (accounts.length === 0) {
          const accountResponse =
            await api.get(
              API_ROUTES.FINANCIAL_ACCOUNTS,
              {
                params: {
                  page_size: 1000,
                },
              },
            );

          setLocalAccounts(
            extractList<PaymentAccount>(
              accountResponse.data,
            ),
          );
        } else {
          setLocalAccounts(accounts);
        }
      } catch (loadError) {
        setError(
          getBackendError(loadError),
        );
      } finally {
        setLoadingData(false);
      }
    };

    void loadData();
  }, [
    open,
    reservation,
    reservations,
    accounts,
  ]);

  /* ============================================================
     FERMETURE
  ============================================================ */

  if (!open) {
    return null;
  }

  /* ============================================================
     RESERVATION SELECTIONNEE
  ============================================================ */

  const selectedReservation =
    localReservations.find(
      (item) =>
        item.id === form.reservation,
    ) ?? reservation;

  /* ============================================================
     MONTANTS
  ============================================================ */

  const totalAmount = getTotalAmount(
    selectedReservation,
  );

  const paidAmount = getPaidAmount(
    selectedReservation,
  );

  const refundedAmount =
    getRefundedAmount(
      selectedReservation,
    );

  const remainingAmount =
    getRemainingAmount(
      selectedReservation,
    );

  /*
   * Sécurité supplémentaire côté frontend :
   *
   * Le montant payable ne doit jamais dépasser :
   *
   * total - net payé
   */
  const calculatedRemaining =
    Math.max(
      totalAmount - paidAmount,
      0,
    );

  const maximumPayment =
    selectedReservation
      ? Math.min(
          remainingAmount,
          calculatedRemaining,
        )
      : 0;

  /* ============================================================
     COMPTE PAR DEFAUT
  ============================================================ */

  const activeAccounts = useMemo(
    () =>
      localAccounts.filter(
        (account) =>
          account.is_active !== false,
      ),
    [localAccounts],
  );

  /* ============================================================
     CHOIX RESERVATION
  ============================================================ */

  function handleReservationChange(
    value: string,
  ) {
    const id = Number(value);

    const selected =
      localReservations.find(
        (item) => item.id === id,
      );

    const selectedRemaining =
      getRemainingAmount(selected);

    setForm((previous) => ({
      ...previous,

      reservation:
        id > 0 ? id : null,

      amount:
        selectedRemaining > 0
          ? selectedRemaining.toFixed(2)
          : "",
    }));
  }

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!form.reservation) {
      setError(
        "Veuillez sélectionner une réservation.",
      );
      return;
    }

    const amount = Number(
      form.amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Le montant doit être supérieur à zéro.",
      );
      return;
    }

    if (maximumPayment <= 0) {
      setError(
        "Cette réservation ne possède plus de montant à payer.",
      );
      return;
    }

    if (amount > maximumPayment) {
      setError(
        `Le montant ne peut pas dépasser le reste à payer : ${maximumPayment.toFixed(
          2,
        )} $.`,
      );
      return;
    }

    /*
     * Le compte financier est facultatif ici.
     *
     * Le backend peut utiliser automatiquement
     * la caisse active si aucun compte n'est fourni,
     * selon ta logique métier.
     */

    try {
      setLoading(true);

      /*
       * Protection contre les doubles clics / doubles paiements.
       *
       * Le backend doit utiliser cette clé avec
       * une contrainte d'unicité.
       */
      const idempotencyKey =
        crypto.randomUUID();

      const payload = {
        reservation:
          form.reservation,

        financial_account:
          form.financial_account,

        amount,

        method:
          form.method,

        reference:
          form.reference.trim() ||
          null,

        operator:
          form.operator.trim() ||
          null,

        /*
         * Le paiement est créé en attente.
         * La validation financière est faite
         * ensuite par l'action /valider/.
         */
        status: "EN_ATTENTE",

        idempotency_key:
          idempotencyKey,
      };

      const paymentResponse = await api.post(
        API_ROUTES.PAYMENTS,
        payload,
      );

      const paymentId = Number(
        paymentResponse.data?.id,
      );

      if (!paymentId) {
        throw new Error(
          "Le paiement a été créé mais son identifiant est introuvable. La validation automatique ne peut pas être effectuée.",
        );
      }

      /*
       * Le bouton "Payer" doit effectuer réellement le paiement :
       * création du paiement en attente, puis validation financière.
       */
      const paymentsBaseUrl =
        API_ROUTES.PAYMENTS.replace(/\/+$/, "");

      await api.post(
        `${paymentsBaseUrl}/${paymentId}/valider/`,
      );

      onSuccess?.();
      onClose();
    } catch (submitError) {
      setError(
        getBackendError(
          submitError,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Nouveau paiement
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Enregistrer un paiement pour une réservation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="whitespace-pre-line rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2
                className="mr-2 animate-spin"
                size={20}
              />

              Chargement...
            </div>
          ) : (
            <>
              {/* RESERVATION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Réservation
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <select
                  value={
                    form.reservation ??
                    ""
                  }
                  onChange={(event) =>
                    handleReservationChange(
                      event.target.value,
                    )
                  }
                  disabled={
                    Boolean(reservation) ||
                    loading
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                >
                  <option value="">
                    Sélectionner une réservation
                  </option>

                  {localReservations
                    .filter(
                      (item) =>
                        getRemainingAmount(
                          item,
                        ) > 0,
                    )
                    .map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.reservation_number ||
                          `Réservation #${item.id}`}
                        {" - "}
                        {item.client_full_name ||
                          item.client_name ||
                          "Client"}
                        {" - reste "}
                        {getRemainingAmount(
                          item,
                        ).toFixed(2)}
                        {" $"}
                      </option>
                    ))}
                </select>
              </div>

              {/* DETAILS RESERVATION */}
              {selectedReservation && (
                <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">

                    <div>
                      <p className="text-xs text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {totalAmount.toFixed(
                          2,
                        )}{" "}
                        $
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Net payé
                      </p>

                      <p className="mt-1 font-semibold text-green-400">
                        {paidAmount.toFixed(
                          2,
                        )}{" "}
                        $
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Remboursé
                      </p>

                      <p className="mt-1 font-semibold text-orange-400">
                        {refundedAmount.toFixed(
                          2,
                        )}{" "}
                        $
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Reste à payer
                      </p>

                      <p className="mt-1 font-semibold text-yellow-400">
                        {maximumPayment.toFixed(
                          2,
                        )}{" "}
                        $
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* COMPTE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Compte financier
                </label>

                <select
                  value={
                    form.financial_account ??
                    ""
                  }
                  onChange={(event) => {
                    setForm(
                      (previous) => ({
                        ...previous,
                        financial_account:
                          Number(
                            event.target
                              .value,
                          ) || null,
                      }),
                    );
                  }}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  <option value="">
                    Utiliser la caisse automatique
                  </option>

                  {activeAccounts.map(
                    (account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.name}

                        {account.balance !==
                          undefined
                          ? ` - ${Number(
                              account.balance,
                            ).toFixed(2)} $`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* METHODE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Méthode de paiement
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <select
                  value={
                    form.method
                  }
                  onChange={(event) => {
                    setForm(
                      (previous) => ({
                        ...previous,
                        method:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
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

              {/* MONTANT */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Montant
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={
                    maximumPayment >
                    0
                      ? maximumPayment
                      : undefined
                  }
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={(event) => {
                    setForm(
                      (previous) => ({
                        ...previous,
                        amount:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  disabled={
                    loading ||
                    maximumPayment <=
                      0
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
                  placeholder="0.00"
                  required
                />

                {selectedReservation && (
                  <p className="mt-2 text-xs text-slate-500">
                    Maximum autorisé :{" "}
                    <span className="font-semibold text-yellow-400">
                      {maximumPayment.toFixed(
                        2,
                      )}{" "}
                      $
                    </span>
                  </p>
                )}
              </div>

              {/* REFERENCE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Référence
                </label>

                <input
                  type="text"
                  value={
                    form.reference
                  }
                  onChange={(event) => {
                    setForm(
                      (previous) => ({
                        ...previous,
                        reference:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                  placeholder="Référence bancaire, transaction..."
                />
              </div>

              {/* OPERATEUR */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Opérateur
                </label>

                <input
                  type="text"
                  value={
                    form.operator
                  }
                  onChange={(event) => {
                    setForm(
                      (previous) => ({
                        ...previous,
                        operator:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                  placeholder="Nom de l'opérateur"
                />
              </div>

              {/* INFORMATION */}
              <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4 text-sm text-blue-200">
                Le paiement sera enregistré en
                <strong className="mx-1">
                  attente
                </strong>
                puis devra être validé avant
                l'entrée définitive dans la caisse /
                le compte financier.
              </div>
            </>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingData ||
                !form.reservation ||
                maximumPayment <= 0
              }
              className="flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="mr-2 animate-spin"
                />
              )}

              Enregistrer le paiement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


