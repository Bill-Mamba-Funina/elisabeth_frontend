import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";


/* ============================================================
   BASE URL
   ============================================================ */

/**
 * IMPORTANT :
 *
 * Le /api est défini UNE SEULE FOIS ici.
 *
 * Exemple :
 *
 * API_ROUTES.RESERVATIONS
 * = /reservations/
 *
 * Axios construit :
 *
 * http://127.0.0.1:8000/api/reservations/
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";


/* ============================================================
   TYPES
   ============================================================ */

interface RefreshResponse {
  access: string;
}

interface RetryableRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}


/* ============================================================
   INSTANCE AXIOS
   ============================================================ */

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});


/* ============================================================
   INTERCEPTOR REQUEST
   ============================================================ */

api.interceptors.request.use(
  (config) => {
    /*
     * Le localStorage n'existe pas côté serveur.
     */
    if (typeof window === "undefined") {
      return config;
    }

    const accessToken =
      localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/* ============================================================
   INTERCEPTOR RESPONSE
   ============================================================ */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;


    /* --------------------------------------------------------
       Pas de requête originale
       -------------------------------------------------------- */

    if (!originalRequest) {
      return Promise.reject(error);
    }


    /* --------------------------------------------------------
       URL de la requête
       -------------------------------------------------------- */

    const requestUrl =
      originalRequest.url ?? "";


    /* --------------------------------------------------------
       LOGIN
       -------------------------------------------------------- */

    const isLoginRequest =
      requestUrl.includes("/auth/token/") &&
      !requestUrl.includes(
        "/auth/token/refresh/"
      );


    /* --------------------------------------------------------
       REFRESH JWT
       -------------------------------------------------------- */

    const isRefreshRequest =
      requestUrl.includes(
        "/auth/token/refresh/"
      );


    /* --------------------------------------------------------
       On ne refresh que pour une erreur 401
       -------------------------------------------------------- */

    if (
      error.response?.status !== 401 ||
      isLoginRequest ||
      isRefreshRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }


    /* --------------------------------------------------------
       Côté serveur : pas de localStorage
       -------------------------------------------------------- */

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }


    /* --------------------------------------------------------
       Récupération du refresh token
       -------------------------------------------------------- */

    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );


    /* --------------------------------------------------------
       Aucun refresh token
       -------------------------------------------------------- */

    if (!refreshToken) {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      window.location.href =
        "/login";

      return Promise.reject(error);
    }


    /* --------------------------------------------------------
       Empêcher une boucle infinie
       -------------------------------------------------------- */

    originalRequest._retry = true;


    try {
      /* ------------------------------------------------------
         Refresh JWT avec Axios indépendant
         ------------------------------------------------------ */

      const refreshResponse =
        await axios.post<RefreshResponse>(
          `${API_BASE_URL}/auth/token/refresh/`,

          {
            refresh: refreshToken,
          },

          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );


      /* ------------------------------------------------------
         Nouveau access token
         ------------------------------------------------------ */

      const newAccessToken =
        refreshResponse.data.access;


      if (!newAccessToken) {
        throw new Error(
          "Nouveau jeton d'accès absent."
        );
      }


      /* ------------------------------------------------------
         Sauvegarder le nouveau token
         ------------------------------------------------------ */

      localStorage.setItem(
        "access_token",
        newAccessToken
      );


      /* ------------------------------------------------------
         Mettre à jour la requête originale
         ------------------------------------------------------ */

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      /* ------------------------------------------------------
         Rejouer automatiquement la requête
         ------------------------------------------------------ */

      return api(originalRequest);

    } catch (refreshError) {
      console.error(
        "Échec du renouvellement JWT :",
        refreshError
      );


      /* ------------------------------------------------------
         Nettoyage de l'authentification
         ------------------------------------------------------ */

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );


      /* ------------------------------------------------------
         Retour login
         ------------------------------------------------------ */

      window.location.href =
        "/login";


      return Promise.reject(
        refreshError
      );
    }
  }
);


export default api;

