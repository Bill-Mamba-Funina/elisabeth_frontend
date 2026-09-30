"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import {
  API_ROUTES,
  getApiDetailUrl,
  getPaymentCancelUrl,
  getPaymentReceiptUrl,
  getPaymentValidateUrl,
} from "@/lib/api-routes";

// ============================================================
// TYPES
// ============================================================

type PaymentMethod =
  | "ESPECES"
  | "VIREMENT"
  | "MOBILE_MONEY";

type PaymentStatus =
  | "EN_ATTENTE"
  | "VALIDE"
  | "ANNULE";

interface Client {
  id: number | string;
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

interface Reservation {
  id: number | string;

  reference?: string;
  reservation_number?: string;

  client?:
    | number
    | string
    | Client
    | null;

  client_name?: string;
  client_full_name?: string;

  date?: string;
  reservation_date?: string;
  event_date?: string;

  montant?: number | string;
  total_amount?: number | string;
  tarif_amount?: number | string;

  montantPaye?: number | string;
  amount_paid?: number | string;

  resteAPayer?: number | string;
  remaining_amount?: number | string;

  paymentStatus?:
    | "NON_PAYE"
    | "PARTIEL"
    | "PAYE";
}

interface FinancialAccount {
  id: number | string;

  name?: string;
  nom?: string;
  account_name?: string;

  type?: string;

  balance?: number | string;
  solde?: number | string;

  is_active?: boolean;
  active?: boolean;
}

export interface Payment {
  id: number | string;

  reservation?:
    | number
    | string
    | Reservation
    | null;

  reservation_number?: string;
  reservation_reference?: string;

  client?:
    | number
    | string
    | Client
    | null;

  client_name?: string;
  client_full_name?: string;

  financial_account?:
    | number
    | string
    | FinancialAccount
    | null;

  amount: number | string;

  payment_date: string;

  method: PaymentMethod;

  reference?: string;

  operator?: string | number | null;

  status: PaymentStatus;

  receipt_pdf?: string | null;

  idempotency_key?: string;

  already_refunded?: number | string;

  refundable_amount?: number | string;
}

interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

interface PaymentFormData {
  reservation: string;
  amount: string;
  payment_date: string;
  method: PaymentMethod;
  reference: string;
  financial_account: string;

  /*
   * CORRECTION IMPORTANTE :
   * le statut doit accepter ANNULE également.
   */
  status: PaymentStatus;
}

interface RefundFormData {
  payment: string;
  amount: string;
  method: PaymentMethod;
  reason: string;
  reference: string;
}

interface ApiErrorShape {
  detail?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// ============================================================
// CONSTANTES
// ============================================================

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "ESPECES",
    label: "Espèces",
  },
  {
    value: "VIREMENT",
    label: "Virement bancaire",
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
  },
];

const PAYMENT_STATUS_LABELS: Record<
  PaymentStatus,
  string
> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Validé",
  ANNULE: "Annulé",
};

const MONTHS = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

// ============================================================
// HELPERS
// ============================================================

function normalizeList<T>(
  response: T[] | PaginatedResponse<T>
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.results)
  ) {
    return response.results;
  }

  return [];
}

function getClientName(
  payment: Payment
): string {
  if (payment.client_name) {
    return payment.client_name;
  }

  if (payment.client_full_name) {
    return payment.client_full_name;
  }

  if (
    payment.client &&
    typeof payment.client === "object"
  ) {
    const client = payment.client;

    if (client.full_name) {
      return client.full_name;
    }

    if (client.name) {
      return client.name;
    }

    const fullName = [
      client.first_name,
      client.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      return fullName;
    }
  }

  const reservation =
    getPaymentReservation(payment);

  if (reservation?.client_name) {
    return reservation.client_name;
  }

  if (reservation?.client_full_name) {
    return reservation.client_full_name;
  }

  if (
    reservation?.client &&
    typeof reservation.client === "object"
  ) {
    const client = reservation.client;

    const fullName = [
      client.first_name,
      client.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      client.full_name ||
      client.name ||
      fullName ||
      "Client inconnu"
    );
  }

  return "Client inconnu";
}

function getPaymentReservation(
  payment: Payment
): Reservation | null {
  if (
    payment.reservation &&
    typeof payment.reservation === "object"
  ) {
    return payment.reservation;
  }

  return null;
}

function getReservationId(
  payment: Payment
): string {
  if (
    payment.reservation !== null &&
    payment.reservation !== undefined &&
    typeof payment.reservation !== "object"
  ) {
    return String(payment.reservation);
  }

  const reservation =
    getPaymentReservation(payment);

  return reservation?.id !== undefined
    ? String(reservation.id)
    : "";
}

function getReservationReference(
  payment: Payment
): string {
  if (payment.reservation_reference) {
    return payment.reservation_reference;
  }

  if (payment.reservation_number) {
    return payment.reservation_number;
  }

  const reservation =
    getPaymentReservation(payment);

  return (
    reservation?.reference ||
    reservation?.reservation_number ||
    "Réservation inconnue"
  );
}

function getAccountName(
  payment: Payment
): string {
  if (
    payment.financial_account &&
    typeof payment.financial_account ===
      "object"
  ) {
    return (
      payment.financial_account.name ||
      payment.financial_account.nom ||
      payment.financial_account.account_name ||
      "Compte financier"
    );
  }

  if (
    payment.financial_account !== null &&
    payment.financial_account !== undefined
  ) {
    return `Compte #${payment.financial_account}`;
  }

  return "—";
}

function getPaymentAmount(
  payment: Payment
): number {
  return Number(payment.amount || 0);
}

function getReservationTotal(
  reservation: Reservation
): number {
  return Number(
    reservation.total_amount ??
      reservation.montant ??
      reservation.tarif_amount ??
      0
  );
}

function getReservationPaid(
  reservation: Reservation
): number {
  return Number(
    reservation.amount_paid ??
      reservation.montantPaye ??
      0
  );
}

function getReservationRemaining(
  reservation: Reservation
): number {
  const explicitRemaining =
    reservation.remaining_amount ??
    reservation.resteAPayer;

  if (
    explicitRemaining !== undefined &&
    explicitRemaining !== null
  ) {
    return Math.max(
      0,
      Number(explicitRemaining)
    );
  }

  return Math.max(
    0,
    getReservationTotal(reservation) -
      getReservationPaid(reservation)
  );
}

function getRefundableAmount(
  payment: Payment
): number {
  if (
    payment.refundable_amount !==
      undefined &&
    payment.refundable_amount !== null
  ) {
    return Math.max(
      0,
      Number(payment.refundable_amount)
    );
  }

  return Math.max(
    0,
    Number(payment.amount || 0) -
      Number(payment.already_refunded || 0)
  );
}

function formatAmount(
  amount: number | string
): string {
  return `${Number(
    amount || 0
  ).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} $`;
}

function formatDate(
  value: string
): string {
  if (!value) {
    return "—";
  }

  const datePart =
    value.substring(0, 10);

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      datePart
    )
  ) {
    const [
      year,
      month,
      day,
    ] = datePart.split("-");

    return `${day}/${month}/${year}`;
  }

  return value;
}

function getStatusClass(
  status: PaymentStatus
): string {
  switch (status) {
    case "VALIDE":
      return "bg-emerald-100 text-emerald-700";

    case "ANNULE":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getMethodLabel(
  method: PaymentMethod
): string {
  return (
    PAYMENT_METHODS.find(
      (item) => item.value === method
    )?.label || method
  );
}

function getTodayDateTime(): string {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const hours = String(
    now.getHours()
  ).padStart(2, "0");

  const minutes = String(
    now.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function extractApiError(
  error: unknown,
  fallback: string
): string {
  const axiosError = error as {
    response?: {
      status?: number;
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
    const typedData =
      data as ApiErrorShape;

    if (typedData.detail) {
      return typedData.detail;
    }

    if (typedData.message) {
      return typedData.message;
    }

    if (typedData.error) {
      return typedData.error;
    }

    const messages =
      Object.entries(typedData)
        .map(([field, value]) => {
          if (Array.isArray(value)) {
            return `${field} : ${value.join(
              ", "
            )}`;
          }

          if (
            typeof value === "object" &&
            value !== null
          ) {
            return `${field} : ${JSON.stringify(
              value
            )}`;
          }

          return `${field} : ${String(
            value
          )}`;
        })
        .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  if (
    axiosError.response?.status === 404
  ) {
    return "La ressource demandée n'existe pas sur l'API Django (404). Vérifiez l'URL dans api-routes.ts et les routes Django.";
  }

  return (
    axiosError.message ||
    fallback
  );
}

// ============================================================
// PAGE
// ============================================================

export default function PaiementsPage() {
  const [
    payments,
    setPayments,
  ] = useState<Payment[]>([]);

  const [
    reservations,
    setReservations,
  ] = useState<Reservation[]>([]);

  const [
    accounts,
    setAccounts,
  ] = useState<FinancialAccount[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // FILTRES
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("TOUS");

  const [
    methodFilter,
    setMethodFilter,
  ] = useState("TOUS");

  const [
    reservationFilter,
    setReservationFilter,
  ] = useState("TOUS");

  const [
    dayFilter,
    setDayFilter,
  ] = useState("TOUS");

  const [
    monthFilter,
    setMonthFilter,
  ] = useState("TOUS");

  const [
    yearFilter,
    setYearFilter,
  ] = useState("TOUS");

  // ==========================================================
  // FORMULAIRE PAIEMENT
  // ==========================================================

  const [
    showPaymentForm,
    setShowPaymentForm,
  ] = useState(false);

  const [
    editingPayment,
    setEditingPayment,
  ] = useState<Payment | null>(null);

  const [
    savingPayment,
    setSavingPayment,
  ] = useState(false);

  const [
    paymentFormError,
    setPaymentFormError,
  ] = useState("");

  const [
    paymentForm,
    setPaymentForm,
  ] = useState<PaymentFormData>({
    reservation: "",
    amount: "",
    payment_date:
      getTodayDateTime(),
    method: "ESPECES",
    reference: "",
    financial_account: "",
    status: "EN_ATTENTE",
  });

  // ==========================================================
  // ACTIONS
  // ==========================================================

  const [
    processingPayment,
    setProcessingPayment,
  ] = useState<
    number | string | null
  >(null);

  const [
    processingDelete,
    setProcessingDelete,
  ] = useState<
    number | string | null
  >(null);

  // ==========================================================
  // REMBOURSEMENT
  // ==========================================================

  const [
    refundPayment,
    setRefundPayment,
  ] = useState<Payment | null>(null);

  const [
    refundForm,
    setRefundForm,
  ] = useState<RefundFormData>({
    payment: "",
    amount: "",
    method: "ESPECES",
    reason: "",
    reference: "",
  });

  const [
    refundError,
    setRefundError,
  ] = useState("");

  const [
    processingRefund,
    setProcessingRefund,
  ] = useState(false);

  // ==========================================================
  // CHARGEMENT LISTE
  // ==========================================================

  async function loadList<T>(
    url: string
  ): Promise<T[]> {
    const response =
      await api.get<
        T[] | PaginatedResponse<T>
      >(url);

    return normalizeList(
      response.data
    );
  }

  // ==========================================================
  // CHARGEMENT GLOBAL
  // ==========================================================

  async function loadData(
    showLoading = true
  ) {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const results =
        await Promise.allSettled([
          loadList<Payment>(
            `${API_ROUTES.PAYMENTS}?page_size=1000`
          ),

          loadList<Reservation>(
            `${API_ROUTES.RESERVATIONS}?page_size=1000`
          ),

          loadList<FinancialAccount>(
            `${API_ROUTES.FINANCIAL_ACCOUNTS}?page_size=1000`
          ),
        ]);

      const [
        paymentsResult,
        reservationsResult,
        accountsResult,
      ] = results;

      const errors: string[] = [];

      // --------------------------------------------------------
      // PAIEMENTS
      // --------------------------------------------------------

      if (
        paymentsResult.status ===
        "fulfilled"
      ) {
        setPayments(
          paymentsResult.value
        );
      } else {
        errors.push(
          `Paiements : ${extractApiError(
            paymentsResult.reason,
            "Impossible de charger les paiements."
          )}`
        );
      }

      // --------------------------------------------------------
      // RÉSERVATIONS
      // --------------------------------------------------------

      if (
        reservationsResult.status ===
        "fulfilled"
      ) {
        setReservations(
          reservationsResult.value
        );
      } else {
        errors.push(
          `Réservations : ${extractApiError(
            reservationsResult.reason,
            "Impossible de charger les réservations."
          )}`
        );
      }

      // --------------------------------------------------------
      // COMPTES
      // --------------------------------------------------------

      if (
        accountsResult.status ===
        "fulfilled"
      ) {
        setAccounts(
          accountsResult.value
        );
      } else {
        /*
         * Le compte financier n'est pas bloquant
         * pour afficher les paiements.
         */

        try {
          const fallbackAccounts =
            await loadList<FinancialAccount>(
              "/accounts/?page_size=1000"
            );

          setAccounts(
            fallbackAccounts
          );
        } catch {
          setAccounts([]);

          console.warn(
            "Impossible de charger les comptes financiers."
          );
        }
      }

      /*
       * Paiements et réservations sont critiques.
       * Les comptes ne le sont pas.
       */
      if (
        paymentsResult.status ===
          "rejected" ||
        reservationsResult.status ===
          "rejected"
      ) {
        setError(
          errors.join(" | ")
        );
      }
    } catch (err: unknown) {
      console.error(
        "Erreur chargement paiements :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible de charger les données des paiements."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // ==========================================================
  // ANNÉES
  // ==========================================================

  const availableYears =
    useMemo(() => {
      const years =
        new Set<string>();

      payments.forEach(
        (payment) => {
          if (!payment.payment_date) {
            return;
          }

          const year =
            payment.payment_date.substring(
              0,
              4
            );

          if (
            /^\d{4}$/.test(year)
          ) {
            years.add(year);
          }
        }
      );

      return Array.from(
        years
      ).sort(
        (a, b) =>
          Number(b) -
          Number(a)
      );
    }, [payments]);

  // ==========================================================
  // RÉSERVATIONS PAYABLES
  // ==========================================================

  const payableReservations =
    useMemo(() => {
      return reservations.filter(
        (reservation) =>
          getReservationRemaining(
            reservation
          ) > 0
      );
    }, [reservations]);

  // ==========================================================
  // FILTRAGE
  // ==========================================================

  const filteredPayments =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          const clientName =
            getClientName(payment);

          const reservationReference =
            getReservationReference(
              payment
            );

          const amount =
            formatAmount(
              payment.amount
            );

          const paymentReference =
            payment.reference || "";

          const matchesSearch =
            !term ||
            clientName
              .toLowerCase()
              .includes(term) ||
            reservationReference
              .toLowerCase()
              .includes(term) ||
            paymentReference
              .toLowerCase()
              .includes(term) ||
            amount
              .toLowerCase()
              .includes(term);

          const matchesStatus =
            statusFilter === "TOUS" ||
            payment.status ===
              statusFilter;

          const matchesMethod =
            methodFilter === "TOUS" ||
            payment.method ===
              methodFilter;

          const matchesReservation =
            reservationFilter ===
              "TOUS" ||
            getReservationId(
              payment
            ) ===
              reservationFilter;

          const paymentDate =
            payment.payment_date
              ? payment.payment_date.substring(
                  0,
                  10
                )
              : "";

          const paymentDay =
            paymentDate.substring(
              8,
              10
            );

          const paymentMonth =
            paymentDate.substring(
              5,
              7
            );

          const paymentYear =
            paymentDate.substring(
              0,
              4
            );

          const matchesDay =
            dayFilter === "TOUS" ||
            paymentDay ===
              dayFilter;

          const matchesMonth =
            monthFilter === "TOUS" ||
            paymentMonth ===
              monthFilter;

          const matchesYear =
            yearFilter === "TOUS" ||
            paymentYear ===
              yearFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMethod &&
            matchesReservation &&
            matchesDay &&
            matchesMonth &&
            matchesYear
          );
        }
      );
    }, [
      payments,
      search,
      statusFilter,
      methodFilter,
      reservationFilter,
      dayFilter,
      monthFilter,
      yearFilter,
    ]);

  // ==========================================================
  // TOTAUX
  // ==========================================================

  const totals =
    useMemo(() => {
      const total =
        payments.reduce(
          (sum, payment) =>
            sum +
            getPaymentAmount(
              payment
            ),
          0
        );

      const validated =
        payments
          .filter(
            (payment) =>
              payment.status ===
              "VALIDE"
          )
          .reduce(
            (sum, payment) =>
              sum +
              getPaymentAmount(
                payment
              ),
            0
          );

      const pending =
        payments
          .filter(
            (payment) =>
              payment.status ===
              "EN_ATTENTE"
          )
          .reduce(
            (sum, payment) =>
              sum +
              getPaymentAmount(
                payment
              ),
            0
          );

      const cancelled =
        payments
          .filter(
            (payment) =>
              payment.status ===
              "ANNULE"
          )
          .reduce(
            (sum, payment) =>
              sum +
              getPaymentAmount(
                payment
              ),
            0
          );

      return {
        total,
        validated,
        pending,
        cancelled,
      };
    }, [payments]);

  // ==========================================================
  // RESET FILTRES
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("TOUS");
    setMethodFilter("TOUS");
    setReservationFilter("TOUS");
    setDayFilter("TOUS");
    setMonthFilter("TOUS");
    setYearFilter("TOUS");
  }

  // ==========================================================
  // CRÉATION
  // ==========================================================

  function openCreateForm() {
    setEditingPayment(null);

    setPaymentForm({
      reservation: "",
      amount: "",
      payment_date:
        getTodayDateTime(),
      method: "ESPECES",
      reference: "",
      financial_account: "",
      status: "EN_ATTENTE",
    });

    setPaymentFormError("");
    setShowPaymentForm(true);
  }

  // ==========================================================
  // MODIFICATION
  // ==========================================================

  function openEditForm(
    payment: Payment
  ) {
    setEditingPayment(payment);

    setPaymentForm({
      reservation:
        getReservationId(payment),

      amount:
        String(payment.amount),

      payment_date:
        payment.payment_date
          ? payment.payment_date.substring(
              0,
              16
            )
          : getTodayDateTime(),

      method:
        payment.method,

      reference:
        payment.reference || "",

      financial_account:
        payment.financial_account &&
        typeof payment.financial_account !==
          "object"
          ? String(
              payment.financial_account
            )
          : "",

      /*
       * CORRECTION :
       * on conserve réellement le statut
       * existant, y compris ANNULE.
       */
      status:
        payment.status,
    });

    setPaymentFormError("");
    setShowPaymentForm(true);
  }

  function closePaymentForm() {
    if (savingPayment) {
      return;
    }

    setShowPaymentForm(false);
    setEditingPayment(null);
    setPaymentFormError("");
  }

  // ==========================================================
  // CHANGEMENT RÉSERVATION
  // ==========================================================

  function handleReservationChange(
    reservationId: string
  ) {
    setPaymentForm(
      (previous) => {
        const reservation =
          reservations.find(
            (item) =>
              String(item.id) ===
              reservationId
          );

        return {
          ...previous,
          reservation:
            reservationId,
          amount: reservation
            ? getReservationRemaining(
                reservation
              ).toFixed(2)
            : "",
        };
      }
    );
  }

  // ==========================================================
  // ENREGISTRER PAIEMENT
  // ==========================================================

  async function handleSubmitPayment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPaymentFormError("");

    const reservationId =
      paymentForm.reservation;

    const amount = Number(
      paymentForm.amount
    );

    const reservation =
      reservations.find(
        (item) =>
          String(item.id) ===
          reservationId
      );

    if (!reservationId) {
      setPaymentFormError(
        "Veuillez sélectionner une réservation."
      );
      return;
    }

    if (!reservation) {
      setPaymentFormError(
        "La réservation sélectionnée est introuvable."
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setPaymentFormError(
        "Veuillez saisir un montant valide."
      );
      return;
    }

    const remaining =
      getReservationRemaining(
        reservation
      );

    /*
     * Pour un nouveau paiement, le montant
     * ne peut jamais dépasser le reste.
     */
    if (
      !editingPayment &&
      amount > remaining
    ) {
      setPaymentFormError(
        `Le paiement ne peut pas dépasser le reste à payer de ${formatAmount(
          remaining
        )}.`
      );
      return;
    }

    if (
      paymentForm.method !==
        "ESPECES" &&
      !paymentForm.reference.trim()
    ) {
      setPaymentFormError(
        "La référence est obligatoire pour un virement ou un paiement Mobile Money."
      );
      return;
    }

    try {
      setSavingPayment(true);

      const payload = {
        reservation:
          Number(reservationId),

        amount:
          amount.toFixed(2),

        payment_date:
          paymentForm.payment_date,

        method:
          paymentForm.method,

        reference:
          paymentForm.reference.trim(),

        financial_account:
          paymentForm
            .financial_account
            ? Number(
                paymentForm.financial_account
              )
            : null,

        status:
          paymentForm.status,
      };

      if (editingPayment) {
        await api.patch(
          getApiDetailUrl(
            API_ROUTES.PAYMENTS,
            editingPayment.id
          ),
          payload
        );
      } else {
        await api.post(
          API_ROUTES.PAYMENTS,
          payload
        );
      }

      setShowPaymentForm(false);
      setEditingPayment(null);
      setPaymentFormError("");

      await loadData(false);
    } catch (err: unknown) {
      console.error(
        "Erreur enregistrement paiement :",
        err
      );

      setPaymentFormError(
        extractApiError(
          err,
          "Impossible d'enregistrer le paiement."
        )
      );
    } finally {
      setSavingPayment(false);
    }
  }

  // ==========================================================
  // VALIDER
  // ==========================================================

  async function handleValidatePayment(
    payment: Payment
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous valider le paiement de ${formatAmount(
          payment.amount
        )} pour ${getReservationReference(
          payment
        )} ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingPayment(
        payment.id
      );

      setError("");

      await api.post(
        getPaymentValidateUrl(
          payment.id
        )
      );

      await loadData(false);
    } catch (err: unknown) {
      console.error(
        "Erreur validation paiement :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible de valider le paiement."
        )
      );
    } finally {
      setProcessingPayment(null);
    }
  }

  // ==========================================================
  // ANNULER
  // ==========================================================

  async function handleCancelPayment(
    payment: Payment
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment annuler le paiement de ${formatAmount(
          payment.amount
        )} ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingPayment(
        payment.id
      );

      setError("");

      await api.post(
        getPaymentCancelUrl(
          payment.id
        )
      );

      await loadData(false);
    } catch (err: unknown) {
      console.error(
        "Erreur annulation paiement :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible d'annuler le paiement."
        )
      );
    } finally {
      setProcessingPayment(null);
    }
  }

  // ==========================================================
  // SUPPRIMER
  // ==========================================================

  async function handleDeletePayment(
    payment: Payment
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous supprimer définitivement le paiement de ${formatAmount(
          payment.amount
        )} ?\n\nCette opération peut être refusée par Django si le paiement possède déjà des opérations financières.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingDelete(
        payment.id
      );

      setError("");

      await api.delete(
        getApiDetailUrl(
          API_ROUTES.PAYMENTS,
          payment.id
        )
      );

      await loadData(false);
    } catch (err: unknown) {
      console.error(
        "Erreur suppression paiement :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible de supprimer le paiement."
        )
      );
    } finally {
      setProcessingDelete(null);
    }
  }

  // ==========================================================
  // REÇU PDF
  // ==========================================================

  async function handleReceipt(
    payment: Payment
  ) {
    try {
      setError("");

      const response =
        await api.get(
          getPaymentReceiptUrl(
            payment.id
          ),
          {
            responseType: "blob",
          }
        );

      const blob = new Blob(
        [response.data],
        {
          type:
            "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 10000);
    } catch (err: unknown) {
      console.error(
        "Erreur reçu PDF :",
        err
      );

      setError(
        extractApiError(
          err,
          "Impossible de générer le reçu PDF."
        )
      );
    }
  }

  // ==========================================================
  // OUVRIR REMBOURSEMENT
  // ==========================================================

  function openRefund(
    payment: Payment
  ) {
    setError("");

    if (
      payment.status !== "VALIDE"
    ) {
      setError(
        "Seul un paiement validé peut être remboursé."
      );
      return;
    }

    const refundable =
      getRefundableAmount(payment);

    if (refundable <= 0) {
      setError(
        "Ce paiement ne possède plus de montant remboursable."
      );
      return;
    }

    setRefundPayment(payment);

    setRefundForm({
      payment:
        String(payment.id),

      amount:
        refundable.toFixed(2),

      method:
        payment.method,

      reason: "",

      reference: "",
    });

    setRefundError("");
  }

  function closeRefund() {
    if (processingRefund) {
      return;
    }

    setRefundPayment(null);
    setRefundError("");
  }

  // ==========================================================
  // REMBOURSEMENT
  // ==========================================================

  async function handleRefund(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!refundPayment) {
      return;
    }

    setRefundError("");

    const amount = Number(
      refundForm.amount
    );

    const refundable =
      getRefundableAmount(
        refundPayment
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setRefundError(
        "Veuillez saisir un montant de remboursement valide."
      );
      return;
    }

    if (amount > refundable) {
      setRefundError(
        `Le remboursement ne peut pas dépasser ${formatAmount(
          refundable
        )}.`
      );
      return;
    }

    if (
      !refundForm.reason.trim()
    ) {
      setRefundError(
        "Veuillez renseigner le motif du remboursement."
      );
      return;
    }

    if (
      refundForm.method !==
        "ESPECES" &&
      !refundForm.reference.trim()
    ) {
      setRefundError(
        "La référence est obligatoire pour un remboursement par virement ou Mobile Money."
      );
      return;
    }

    try {
      setProcessingRefund(true);

      await api.post(
        API_ROUTES.REFUNDS,
        {
          payment:
            Number(
              refundPayment.id
            ),

          amount:
            amount.toFixed(2),

          method:
            refundForm.method,

          reason:
            refundForm.reason.trim(),

          reference:
            refundForm.reference.trim(),
        }
      );

      setRefundPayment(null);
      setRefundError("");

      await loadData(false);
    } catch (err: unknown) {
      console.error(
        "Erreur remboursement :",
        err
      );

      setRefundError(
        extractApiError(
          err,
          "Impossible d'enregistrer le remboursement."
        )
      );
    } finally {
      setProcessingRefund(false);
    }
  }

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            Chargement des paiements...
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">

      {/* EN-TÊTE */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Paiements
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Gestion des paiements, validations,
            reçus et remboursements.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void loadData(false)
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Actualiser
          </button>

          <button
            type="button"
            onClick={
              openCreateForm
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />

            Nouveau paiement
          </button>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* INDICATEURS */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Total paiements
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {formatAmount(
              totals.total
            )}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-900/50 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Paiements validés
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {formatAmount(
              totals.validated
            )}
          </p>
        </div>

        <div className="rounded-xl border border-amber-900/50 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            En attente
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {formatAmount(
              totals.pending
            )}
          </p>
        </div>

        <div className="rounded-xl border border-red-900/50 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Annulés
          </p>

          <p className="mt-2 text-2xl font-bold text-red-400">
            {formatAmount(
              totals.cancelled
            )}
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 p-4">

          <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_220px]">

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
                placeholder="Rechercher client, référence ou réservation..."
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

              <option value="VALIDE">
                Validé
              </option>

              <option value="ANNULE">
                Annulé
              </option>
            </select>

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="TOUS">
                Tous les modes
              </option>

              {PAYMENT_METHODS.map(
                (method) => (
                  <option
                    key={method.value}
                    value={
                      method.value
                    }
                  >
                    {method.label}
                  </option>
                )
              )}
            </select>

            <select
              value={
                reservationFilter
              }
              onChange={(event) =>
                setReservationFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="TOUS">
                Toutes les réservations
              </option>

              {reservations.map(
                (reservation) => (
                  <option
                    key={reservation.id}
                    value={String(
                      reservation.id
                    )}
                  >
                    {reservation.reference ||
                      reservation.reservation_number ||
                      `Réservation #${reservation.id}`}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <select
              value={dayFilter}
              onChange={(event) =>
                setDayFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="TOUS">
                Tous les jours
              </option>

              {Array.from(
                { length: 31 },
                (_, index) => {
                  const day =
                    String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    );

                  return (
                    <option
                      key={day}
                      value={day}
                    >
                      Jour {day}
                    </option>
                  );
                }
              )}
            </select>

            <select
              value={monthFilter}
              onChange={(event) =>
                setMonthFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="TOUS">
                Tous les mois
              </option>

              {MONTHS.map(
                (month) => (
                  <option
                    key={month.value}
                    value={
                      month.value
                    }
                  >
                    {month.label}
                  </option>
                )
              )}
            </select>

            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="TOUS">
                Toutes les années
              </option>

              {availableYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Réinitialiser
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {filteredPayments.length}{" "}
            paiement(s) affiché(s) sur{" "}
            {payments.length}.
          </div>
        </div>
      </section>

      {/* TABLEAU */}
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1450px] text-left text-sm">

            <thead className="bg-slate-950">

              <tr className="border-b border-slate-800">

                <th className="px-5 py-3 text-slate-400">
                  N°
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Réservation
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Client
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Montant
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Date
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Mode
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Référence
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Compte
                </th>

                <th className="px-5 py-3 text-slate-400">
                  Statut
                </th>

                <th className="px-5 py-3 text-center text-slate-400">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredPayments.map(
                (
                  payment,
                  index
                ) => {
                  const isProcessing =
                    processingPayment ===
                    payment.id;

                  const isDeleting =
                    processingDelete ===
                    payment.id;

                  const refundable =
                    getRefundableAmount(
                      payment
                    );

                  const canRefund =
                    payment.status ===
                      "VALIDE" &&
                    refundable > 0;

                  return (
                    <tr
                      key={
                        payment.id
                      }
                      className="border-b border-slate-800 align-top transition hover:bg-slate-800/50"
                    >

                      <td className="px-5 py-4 font-bold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">

                        <div className="font-semibold text-white">
                          {getReservationReference(
                            payment
                          )}
                        </div>

                        {getReservationId(
                          payment
                        ) && (
                          <Link
                            href={`/reservations/${getReservationId(
                              payment
                            )}`}
                            className="mt-1 inline-block text-xs text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            Voir la réservation
                          </Link>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-white">
                          {getClientName(
                            payment
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-bold text-white">
                          {formatAmount(
                            payment.amount
                          )}
                        </span>

                        {payment.status ===
                          "VALIDE" &&
                          refundable >
                            0 && (
                            <div className="mt-1 text-xs text-slate-500">
                              Remboursable :{" "}
                              {formatAmount(
                                refundable
                              )}
                            </div>
                          )}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {formatDate(
                          payment.payment_date
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {getMethodLabel(
                          payment.method
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {payment.reference ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {getAccountName(
                          payment
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {
                            PAYMENT_STATUS_LABELS[
                              payment.status
                            ]
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap justify-center gap-2">

                          {payment.status ===
                            "EN_ATTENTE" && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleValidatePayment(
                                  payment
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              title="Valider le paiement"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800 bg-emerald-950/50 text-emerald-300 transition hover:bg-emerald-900/50 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {payment.status !==
                            "VALIDE" && (
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  payment
                                )
                              }
                              title="Modifier le paiement"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-800 bg-blue-950/50 text-blue-300 transition hover:bg-blue-900/50"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}

                          {payment.status !==
                            "ANNULE" && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleCancelPayment(
                                  payment
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              title="Annuler le paiement"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-800 bg-amber-950/50 text-amber-300 transition hover:bg-amber-900/50 disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          {payment.status ===
                            "VALIDE" && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleReceipt(
                                  payment
                                )
                              }
                              title="Ouvrir le reçu PDF"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          )}

                          {canRefund && (
                            <button
                              type="button"
                              onClick={() =>
                                openRefund(
                                  payment
                                )
                              }
                              title="Rembourser"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-purple-800 bg-purple-950/50 text-purple-300 transition hover:bg-purple-900/50"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeletePayment(
                                payment
                              )
                            }
                            disabled={
                              isDeleting
                            }
                            title="Supprimer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-800 bg-red-950/50 text-red-300 transition hover:bg-red-900/50 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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

        {filteredPayments.length ===
          0 && (
          <div className="p-12 text-center">

            <FileText className="mx-auto h-10 w-10 text-slate-700" />

            <p className="mt-3 text-slate-400">
              Aucun paiement trouvé.
            </p>

          </div>
        )}
      </section>

      {/* ======================================================
          MODAL PAIEMENT
      ====================================================== */}

      {showPaymentForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

            <div className="border-b border-slate-800 p-5">

              <h2 className="text-xl font-bold text-white">
                {editingPayment
                  ? "Modifier le paiement"
                  : "Nouveau paiement"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Les validations métier définitives sont effectuées par Django.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmitPayment
              }
              className="space-y-5 p-5"
            >

              {paymentFormError && (
                <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                  {paymentFormError}
                </div>
              )}

              {/* RÉSERVATION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Réservation *
                </label>

                <select
                  value={
                    paymentForm.reservation
                  }
                  onChange={(event) =>
                    handleReservationChange(
                      event.target.value
                    )
                  }
                  disabled={
                    Boolean(
                      editingPayment
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    Sélectionner une réservation
                  </option>

                  {(editingPayment
                    ? reservations
                    : payableReservations
                  ).map(
                    (reservation) => (
                      <option
                        key={
                          reservation.id
                        }
                        value={String(
                          reservation.id
                        )}
                      >
                        {reservation.reference ||
                          reservation.reservation_number ||
                          `Réservation #${reservation.id}`}
                        {" — "}
                        {reservation.client_name ||
                          reservation.client_full_name ||
                          "Client"}
                        {" — reste "}
                        {formatAmount(
                          getReservationRemaining(
                            reservation
                          )
                        )}
                      </option>
                    )
                  )}

                </select>
              </div>

              {/* MONTANT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Montant *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    paymentForm.amount
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (previous) => ({
                        ...previous,
                        amount:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="0.00"
                />

                {paymentForm.reservation &&
                  (() => {
                    const selectedReservation =
                      reservations.find(
                        (reservation) =>
                          String(
                            reservation.id
                          ) ===
                          paymentForm.reservation
                      );

                    if (
                      !selectedReservation
                    ) {
                      return null;
                    }

                    return (
                      <p className="mt-2 text-xs text-slate-400">
                        Reste à payer :{" "}
                        <span className="font-semibold text-emerald-400">
                          {formatAmount(
                            getReservationRemaining(
                              selectedReservation
                            )
                          )}
                        </span>
                      </p>
                    );
                  })()}

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Date du paiement *
                </label>

                <input
                  type="datetime-local"
                  value={
                    paymentForm.payment_date
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (previous) => ({
                        ...previous,
                        payment_date:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* MODE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Mode de paiement *
                </label>

                <select
                  value={
                    paymentForm.method
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (previous) => ({
                        ...previous,
                        method:
                          event.target
                            .value as PaymentMethod,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
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
              </div>

              {/* RÉFÉRENCE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Référence
                  {paymentForm.method !==
                    "ESPECES" &&
                    " *"}
                </label>

                <input
                  type="text"
                  value={
                    paymentForm.reference
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (previous) => ({
                        ...previous,
                        reference:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  placeholder={
                    paymentForm.method ===
                    "ESPECES"
                      ? "Facultatif"
                      : "Numéro de transaction"
                  }
                />
              </div>

              {/* COMPTE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Compte financier
                </label>

                <select
                  value={
                    paymentForm.financial_account
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (previous) => ({
                        ...previous,
                        financial_account:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                >

                  <option value="">
                    Automatique / aucun compte
                  </option>

                  {accounts
                    .filter(
                      (account) =>
                        account.is_active !==
                          false &&
                        account.active !==
                          false
                    )
                    .map(
                      (account) => (
                        <option
                          key={
                            account.id
                          }
                          value={String(
                            account.id
                          )}
                        >
                          {account.name ||
                            account.nom ||
                            account.account_name ||
                            `Compte #${account.id}`}
                        </option>
                      )
                    )}

                </select>

                {accounts.length ===
                  0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    Aucun compte financier disponible.
                    Le backend Django appliquera sa logique
                    de compte automatique si elle est prévue.
                  </p>
                )}
              </div>

              {/* STATUT */}

              {!editingPayment && (
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Statut initial
                  </label>

                  <select
                    value={
                      paymentForm.status
                    }
                    onChange={(event) =>
                      setPaymentForm(
                        (previous) => ({
                          ...previous,
                          status:
                            event.target
                              .value as PaymentStatus,
                        })
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >

                    <option value="EN_ATTENTE">
                      En attente
                    </option>

                    <option value="VALIDE">
                      Validé
                    </option>

                  </select>
                </div>
              )}

              {/* BOUTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closePaymentForm
                  }
                  disabled={
                    savingPayment
                  }
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    savingPayment
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >

                  {savingPayment && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingPayment
                    ? "Enregistrer les modifications"
                    : "Enregistrer le paiement"}

                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL REMBOURSEMENT
      ====================================================== */}

      {refundPayment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

            <div className="border-b border-slate-800 p-5">

              <h2 className="text-xl font-bold text-white">
                Remboursement
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Paiement :{" "}
                {getReservationReference(
                  refundPayment
                )}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Client :{" "}
                <span className="font-semibold text-white">
                  {getClientName(
                    refundPayment
                  )}
                </span>
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Montant initial :{" "}
                <span className="font-semibold text-white">
                  {formatAmount(
                    refundPayment.amount
                  )}
                </span>
              </p>

              <p className="mt-1 text-sm text-purple-400">
                Montant remboursable :{" "}
                {formatAmount(
                  getRefundableAmount(
                    refundPayment
                  )
                )}
              </p>

            </div>

            <form
              onSubmit={
                handleRefund
              }
              className="space-y-5 p-5"
            >

              {refundError && (
                <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                  {refundError}
                </div>
              )}

              {/* MONTANT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Montant du remboursement *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    refundForm.amount
                  }
                  onChange={(event) =>
                    setRefundForm(
                      (previous) => ({
                        ...previous,
                        amount:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                />

              </div>

              {/* MODE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Mode de remboursement *
                </label>

                <select
                  value={
                    refundForm.method
                  }
                  onChange={(event) =>
                    setRefundForm(
                      (previous) => ({
                        ...previous,
                        method:
                          event.target
                            .value as PaymentMethod,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
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
              </div>

              {/* MOTIF */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Motif *
                </label>

                <textarea
                  value={
                    refundForm.reason
                  }
                  onChange={(event) =>
                    setRefundForm(
                      (previous) => ({
                        ...previous,
                        reason:
                          event.target
                            .value,
                      })
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Motif du remboursement..."
                />
              </div>

              {/* RÉFÉRENCE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Référence
                  {refundForm.method !==
                    "ESPECES" &&
                    " *"}
                </label>

                <input
                  type="text"
                  value={
                    refundForm.reference
                  }
                  onChange={(event) =>
                    setRefundForm(
                      (previous) => ({
                        ...previous,
                        reference:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Référence du remboursement"
                />
              </div>

              {/* BOUTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeRefund
                  }
                  disabled={
                    processingRefund
                  }
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    processingRefund
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                >

                  {processingRefund ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}

                  Valider le remboursement

                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

