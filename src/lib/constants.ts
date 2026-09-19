export const APP_NAME = "Elisabeth";

export const CURRENCY = "USD";

export const CURRENCY_LABEL = "USD";

export const DEFAULT_PAGE_SIZE = 20;

export const RESERVATION_STATUSES = [
  "EN_ATTENTE",
  "CONFIRMEE",
  "ANNULEE",
  "TERMINEE",
] as const;

export const PAYMENT_STATUSES = [
  "EN_ATTENTE",
  "PARTIEL",
  "PAYE",
  "ANNULE",
] as const;

export const USER_ROLES = [
  "ADMIN",
  "GERANTE",
  "CAISSIER",
  "AGENT_SECURITE",
  "DECORATEUR",
  "TECHNICIEN",
  "NETTOYEUR",
] as const;
