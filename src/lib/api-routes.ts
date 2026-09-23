export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/token/",
    REFRESH: "/auth/refresh/",
  },

  CLIENTS: "/clients/",`r`n  ACCOUNTS: "/accounts/",
  HALLS: "/halls/",
  SERVICES: "/services/",
  MATERIALS: "/materials/",

  RESERVATIONS: "/reservations/",
  RESERVATION_SERVICES: "/reservation-services/",
  RESERVATION_MATERIALS: "/reservation-materials/",

  PAYMENTS: "/payments/",
  EXPENSES: "/expenses/",
  CASH_MOVEMENTS: "/cash-movements/",

  FINANCES: {
    PAIEMENTS: "/payments/",
    DEPENSES: "/expenses/",
    MOUVEMENTS: "/cash-movements/",
  },

  PERSONNEL: "/personnel/",

  DASHBOARD: "/dashboard/",

  CALENDAR: "/calendar",

  NOTIFICATIONS: "/notifications/",
  DOCUMENTS: "/documents/",
  RAPPORTS: "/rapports/",
} as const;

