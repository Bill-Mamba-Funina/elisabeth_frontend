"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  Loader2,
  LockKeyhole,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface LoginResponse {
  access?: string;
  refresh?: string;
}

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
}

function getLoginErrorMessage(
  error: unknown
): string {
  const axiosError =
    error as AxiosLikeError;

  const status =
    axiosError.response?.status;

  const detail =
    axiosError.response?.data?.detail;

  if (status === 401) {
    return "Nom d'utilisateur ou mot de passe incorrect.";
  }

  if (
    typeof detail === "string" &&
    detail.trim()
  ) {
    return detail;
  }

  if (
    status === 400
  ) {
    return "Les informations de connexion sont invalides.";
  }

  if (
    status &&
    status >= 500
  ) {
    return "Le serveur rencontre actuellement un problème. Vérifiez le backend Django.";
  }

  if (
    axiosError.message ===
    "Network Error"
  ) {
    return "Impossible de joindre le serveur Django. Vérifiez que le backend est démarré sur http://127.0.0.1:8000.";
  }

  return "Impossible de se connecter au serveur. Vérifiez que le backend Django est démarré.";
}

export default function LoginPage() {
  const router = useRouter();

  const [credentials, setCredentials] =
    useState({
      username: "",
      password: "",
    });

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  function handleUsernameChange(
    value: string
  ) {
    setCredentials((previous) => ({
      ...previous,
      username: value,
    }));
  }

  function handlePasswordChange(
    value: string
  ) {
    setCredentials((previous) => ({
      ...previous,
      password: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError(null);

    const username =
      credentials.username.trim();

    const password =
      credentials.password;

    if (!username) {
      setError(
        "Veuillez saisir votre nom d'utilisateur."
      );
      return;
    }

    if (!password) {
      setError(
        "Veuillez saisir votre mot de passe."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post<LoginResponse>(
          API_ROUTES.AUTH.LOGIN,
          {
            username,
            password,
          }
        );

      const accessToken =
        response.data?.access;

      const refreshToken =
        response.data?.refresh;

      if (
        !accessToken ||
        typeof accessToken !== "string"
      ) {
        setError(
          "Réponse du serveur invalide : jeton d'accès manquant."
        );
        return;
      }

      /*
       * Nettoyage de l'ancien token avant
       * d'enregistrer le nouveau.
       */
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.setItem(
        "access_token",
        accessToken
      );

      if (
        refreshToken &&
        typeof refreshToken === "string"
      ) {
        localStorage.setItem(
          "refresh_token",
          refreshToken
        );
      }

      /*
       * On remplace la page de connexion
       * dans l'historique du navigateur.
       */
      router.replace("/dashboard");

      /*
       * Demande à Next.js de rafraîchir
       * les données de la nouvelle route.
       */
      router.refresh();
    } catch (error: unknown) {
      console.error(
        "Erreur de connexion :",
        error
      );

      setError(
        getLoginErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          {/* EN-TÊTE */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <LockKeyhole className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold">
              La Casa Da Festa Elisabeth
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Connexion à l'application Elisabeth
            </p>
          </div>

          {/* ERREUR */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* FORMULAIRE */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NOM UTILISATEUR */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nom d'utilisateur
              </label>

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  value={credentials.username}
                  onChange={(event) =>
                    handleUsernameChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Votre nom d'utilisateur"
                />
              </div>
            </div>

            {/* MOT DE PASSE */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Mot de passe
              </label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  value={credentials.password}
                  onChange={(event) =>
                    handlePasswordChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            {/* BOUTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* PIED */}
          <p className="mt-6 text-center text-xs text-slate-600">
            Application de gestion de salle de fêtes
          </p>
        </div>
      </div>
    </main>
  );
}

