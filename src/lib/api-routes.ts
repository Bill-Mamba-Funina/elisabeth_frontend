/**
 * ============================================================
 * ROUTES API
 * ============================================================
 *
 * api.ts possède déjà :
 *
 * baseURL = http://127.0.0.1:8000/api
 *
 * Les routes ci-dessous ne commencent donc PAS par /api.
 * ============================================================
 */

const API_BASE_PATH = "";

export const API_ROUTES = {
  /* ==========================================================
     AUTHENTIFICATION
     ========================================================== */

  AUTH: {
    LOGIN: `${API_BASE_PATH}/auth/token/`,
    REFRESH: `${API_BASE_PATH}/auth/refresh/`,
  },

  /* ==========================================================
     DASHBOARD
     ========================================================== */

  DASHBOARD: `${API_BASE_PATH}/dashboard/`,

  DASHBOARD_EXCEL:
    `${API_BASE_PATH}/dashboard/excel/`,

  DASHBOARD_PDF:
    `${API_BASE_PATH}/dashboard/pdf/`,

  /* ==========================================================
     CLIENTS
     ========================================================== */

  CLIENTS: `${API_BASE_PATH}/clients/`,

  /* ==========================================================
     SALLES
     ========================================================== */

  HALLS: `${API_BASE_PATH}/halls/`,

  /* ==========================================================
     SERVICES
     ========================================================== */

  SERVICES: `${API_BASE_PATH}/services/`,

  /* ==========================================================
     MATERIEL
     ========================================================== */

  MATERIALS: `${API_BASE_PATH}/materials/`,

  /* ==========================================================
     PERSONNEL
     ========================================================== */

  PERSONNEL: `${API_BASE_PATH}/personnel/`,

  /* ==========================================================
     RESERVATIONS
     ========================================================== */

  RESERVATIONS: `${API_BASE_PATH}/reservations/`,

  /* ==========================================================
     CALENDRIER
     ========================================================== */

  CALENDAR: `${API_BASE_PATH}/calendar/`,

  /* ==========================================================
     TARIFS
     ========================================================== */

  TARIFS: `${API_BASE_PATH}/tarifs/`,

  /* ==========================================================
     COMPTES FINANCIERS
     ========================================================== */

  FINANCIAL_ACCOUNTS:
    `${API_BASE_PATH}/financial-accounts/`,

  /* ==========================================================
     PAIEMENTS
     ========================================================== */

  PAYMENTS: `${API_BASE_PATH}/payments/`,

  /* ==========================================================
     REMBOURSEMENTS
     ========================================================== */

  REFUNDS: `${API_BASE_PATH}/refunds/`,

  /* ==========================================================
     MOUVEMENTS DE CAISSE
     ========================================================== */

  CASH_MOVEMENTS:
    `${API_BASE_PATH}/cash-movements/`,

  /* ==========================================================
     DEPENSES
     ========================================================== */

  EXPENSES: `${API_BASE_PATH}/expenses/`,

  /* ==========================================================
     CONTRATS
     ========================================================== */

  CONTRACTS: `${API_BASE_PATH}/contracts/`,

  /* ==========================================================
     NOTIFICATIONS
     ========================================================== */

  NOTIFICATIONS:
    `${API_BASE_PATH}/notifications/`,
} as const;

/* ============================================================
   HELPER : URL DETAIL REST
   ============================================================ */

export function getApiDetailUrl(
  route: string,
  id: number | string,
): string {
  const cleanRoute = route.replace(/\/+$/, "");

  return `${cleanRoute}/${encodeURIComponent(String(id))}/`;
}

/* ============================================================
   PAIEMENT : VALIDATION
   ============================================================ */

export function getPaymentValidateUrl(
  paymentId: number | string,
): string {
  return (
    getApiDetailUrl(
      API_ROUTES.PAYMENTS,
      paymentId,
    ) + "valider/"
  );
}

/* ============================================================
   PAIEMENT : ANNULATION
   ============================================================ */

export function getPaymentCancelUrl(
  paymentId: number | string,
): string {
  return (
    getApiDetailUrl(
      API_ROUTES.PAYMENTS,
      paymentId,
    ) + "annuler/"
  );
}

/* ============================================================
   PAIEMENT : REÇU PDF
   ============================================================ */

export function getPaymentReceiptUrl(
  paymentId: number | string,
): string {
  return (
    getApiDetailUrl(
      API_ROUTES.PAYMENTS,
      paymentId,
    ) + "recu/"
  );
}

/* ============================================================
   REMBOURSEMENT : VALIDATION
   ============================================================ */

export function getRefundValidateUrl(
  refundId: number | string,
): string {
  return (
    getApiDetailUrl(
      API_ROUTES.REFUNDS,
      refundId,
    ) + "valider/"
  );
}

/* ============================================================
   REMBOURSEMENT : ANNULATION
   ============================================================ */

export function getRefundCancelUrl(
  refundId: number | string,
): string {
  return (
    getApiDetailUrl(
      API_ROUTES.REFUNDS,
      refundId,
    ) + "annuler/"
  );
}

/* ============================================================
   REMBOURSEMENT : REÇU PDF
   ============================================================ */

export function getRefundReceiptUrl(
  refundId: number | string,
): string {
  return (
    getApiDetailUrl(
      API_ROUTES.REFUNDS,
      refundId,
    ) + "recu/"
  );
}