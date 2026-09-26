"use client";

import { FormEvent, useState } from "react";
import { Loader2, LockKeyhole, User } from "lucide-react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface LoginResponse {
  access?: string;
  refresh?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>(
        API_ROUTES.AUTH.LOGIN,
        {
          username: credentials.username.trim(),
          password: credentials.password,
        }
      );

      if (!res.data.access) {
        setError(
          "Réponse du serveur invalide : jeton d'accès manquant."
        );
        return;
      }

      localStorage.setItem(
        "access_token",
        res.data.access
      );

      if (res.data.refresh) {
        localStorage.setItem(
          "refresh_token",
          res.data.refresh
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Erreur de connexion :", err);

      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            detail?: string;
          };
        };
      };

      if (axiosError.response?.status === 401) {
        setError(
          "Nom d'utilisateur ou mot de passe incorrect."
        );
      } else if (
        axiosError.response?.data?.detail
      ) {
        setError(
          axiosError.response.data.detail
        );
      } else {
        setError(
          "Impossible de se connecter au serveur. Vérifiez que le backend Django est démarré."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">

      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

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

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
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
                  type="text"
                  required
                  autoComplete="username"
                  disabled={loading}
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      username: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Votre nom d'utilisateur"
                />
              </div>
            </div>

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
                  type="password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <p className="mt-6 text-center text-xs text-slate-600">
            Application de gestion de salle de fêtes
          </p>
        </div>
      </div>
    </main>
  );
}

