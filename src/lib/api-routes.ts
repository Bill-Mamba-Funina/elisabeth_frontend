/**
 * ============================================================
 * ROUTES API
 * ============================================================
 *
 * IMPORTANT :
 *
 * api.ts possède déjà :
 *
 * baseURL = http://127.0.0.1:8000/api
 *
 * Les routes ci-dessous NE doivent donc PAS commencer par /api.
 *
 * Exemple :
 *
 * API_ROUTES.RESERVATIONS
 *        ↓
 * /reservations/
 *
 * Axios construit automatiquement :
 *
 * http://127.0.0.1:8000/api/reservations/
 *
 * ============================================================
 */

const API_BASE_PATH = "";

export const API_ROUTES = {
  /* ==========================================================
     AUTHENTIFICATION
     ========================================================== */

  AUTH: {
    LOGIN: `${API_BASE_PATH}/auth/token/`,
    REFRESH: `${API_BASE_PATH}/auth/token/refresh/`,
  },

  /* ==========================================================
     DASHBOARD
     ========================================================== */

  DASHBOARD: `${API_BASE_PATH}/dashboard/`,

  DASHBOARD_EXCEL:
    `${API_BASE_PATH}/dashboard/export/excel/`,

  DASHBOARD_PDF:
    `${API_BASE_PATH}/dashboard/export/pdf/`,

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

  RESERVATIONS:
    `${API_BASE_PATH}/reservations/`,

  /* ==========================================================
     CALENDRIER
     ========================================================== */

  CALENDAR:
    `${API_BASE_PATH}/calendar/`,

  /* ==========================================================
     TARIFS
     ========================================================== */

  TARIFS:
    `${API_BASE_PATH}/tarifs/`,

  /* ==========================================================
     COMPTES FINANCIERS
     ========================================================== */

  FINANCIAL_ACCOUNTS:
    `${API_BASE_PATH}/financial-accounts/`,

  /* ==========================================================
     PAIEMENTS
     ========================================================== */

  PAYMENTS:
    `${API_BASE_PATH}/payments/`,

  /* ==========================================================
     REMBOURSEMENTS
     ========================================================== */

  REFUNDS:
    `${API_BASE_PATH}/refunds/`,

  /* ==========================================================
     MOUVEMENTS DE CAISSE
     ========================================================== */

  CASH_MOVEMENTS:
    `${API_BASE_PATH}/cash-movements/`,

  /* ==========================================================
     DEPENSES
     ========================================================== */

  EXPENSES:
    `${API_BASE_PATH}/expenses/`,

  /* ==========================================================
     CONTRATS
     ========================================================== */

  CONTRACTS:
    `${API_BASE_PATH}/contracts/`,

  /* ==========================================================
     NOTIFICATIONS
     ========================================================== */

  NOTIFICATIONS:
    `${API_BASE_PATH}/notifications/`,
} as const;


/* ============================================================
   HELPER : URL DETAIL REST
   ============================================================ */

/**
 * Construit l'URL d'un élément REST.
 *
 * Exemple :
 *
 * getApiDetailUrl(API_ROUTES.PAYMENTS, 15)
 *
 * donne :
 *
 * /payments/15/
 *
 * Axios transformera automatiquement cela en :
 *
 * http://127.0.0.1:8000/api/payments/15/
 */

export function getApiDetailUrl(
  route: string,
  id: number | string
): string {
  return `${route}${id}/`;
}


/* ============================================================
   PAIEMENT : VALIDATION
   ============================================================ */

/**
 * Exemple :
 *
 * /payments/15/valider/
 */

export function getPaymentValidateUrl(
  paymentId: number | string
): string {
  return `${API_ROUTES.PAYMENTS}${paymentId}/valider/`;
}


/* ============================================================
   PAIEMENT : ANNULATION
   ============================================================ */

/**
 * Exemple :
 *
 * /payments/15/annuler/
 */

export function getPaymentCancelUrl(
  paymentId: number | string
): string {
  return `${API_ROUTES.PAYMENTS}${paymentId}/annuler/`;
}


/* ============================================================
   PAIEMENT : REÇU PDF
   ============================================================ */

/**
 * Exemple :
 *
 * /payments/15/recu/
 */

export function getPaymentReceiptUrl(
  paymentId: number | string
): string {
  return `${API_ROUTES.PAYMENTS}${paymentId}/recu/`;
}


/* ============================================================
   REMBOURSEMENT : VALIDATION
   ============================================================ */

/**
 * À utiliser si Django possède :
 *
 * POST /api/refunds/<id>/valider/
 */

export function getRefundValidateUrl(
  refundId: number | string
): string {
  return `${API_ROUTES.REFUNDS}${refundId}/valider/`;
}


/* ============================================================
   REMBOURSEMENT : ANNULATION
   ============================================================ */

/**
 * À utiliser si Django possède :
 *
 * POST /api/refunds/<id>/annuler/
 */

export function getRefundCancelUrl(
  refundId: number | string
): string {
  return `${API_ROUTES.REFUNDS}${refundId}/annuler/`;
}

