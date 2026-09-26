import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Ajoute automatiquement le JWT à chaque requête.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("access");

      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        console.warn(
          "[API] Aucun access_token trouvé dans localStorage."
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Gestion des réponses 401.
 *
 * Pour l'instant on signale clairement le problème
 * sans faire de boucle infinie de refresh.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      console.error(
        "[API] 401 Unauthorized",
        error?.response?.data
      );

      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("access");

      const refreshToken =
        localStorage.getItem("refresh_token") ||
        localStorage.getItem("refresh");

      if (!accessToken) {
        console.error(
          "[API] Aucun access token. L'utilisateur doit se reconnecter."
        );
      } else if (!refreshToken) {
        console.error(
          "[API] Access token présent mais refresh token absent."
        );
      } else {
        console.error(
          "[API] Le JWT présent est probablement expiré ou invalide."
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;

