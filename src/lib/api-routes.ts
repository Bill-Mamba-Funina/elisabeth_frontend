export const API_ROUTES = {
  auth: {
    login: "/auth/login/",
    logout: "/auth/logout/",
    me: "/auth/me/",
    register: "/auth/register/",
  },

  clients: {
    list: "/clients/",
    detail: (id: number | string) => `/clients/${id}/`,
  },

  reservations: {
    list: "/reservations/",
    detail: (id: number | string) => `/reservations/${id}/`,
    create: "/reservations/",
    cancel: (id: number | string) => `/reservations/${id}/annuler/`,
  },

  evenements: {
    list: "/evenements/",
    detail: (id: number | string) => `/evenements/${id}/`,
  },

  salles: {
    list: "/salles/",
    detail: (id: number | string) => `/salles/${id}/`,
    create: "/salles/",
    update: (id: number | string) => `/salles/${id}/`,
    delete: (id: number | string) => `/salles/${id}/`,
  },

  services: {
    list: "/services/",
    detail: (id: number | string) => `/services/${id}/`,
    create: "/services/",
    update: (id: number | string) => `/services/${id}/`,
    delete: (id: number | string) => `/services/${id}/`,
  },

  paiements: {
    list: "/paiements/",
    detail: (id: number | string) => `/paiements/${id}/`,
    create: "/paiements/",
  },

  personnel: {
    list: "/personnel/",
    detail: (id: number | string) => `/personnel/${id}/`,
    create: "/personnel/",
    update: (id: number | string) => `/personnel/${id}/`,
    delete: (id: number | string) => `/personnel/${id}/`,
  },

  materiel: {
    list: "/materiel/",
    detail: (id: number | string) => `/materiel/${id}/`,
  },

  finances: {
    recettes: "/finances/recettes/",
    depenses: "/finances/depenses/",
    rapports: "/finances/rapports/",
  },

  notifications: {
    list: "/notifications/",
    read: (id: number | string) => `/notifications/${id}/lire/`,
  },

  dashboard: {
    summary: "/dashboard/",
  },
} as const;
