"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export default function LoginPage() {
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const res = await api.post(API_ROUTES.AUTH.LOGIN, {
        username: credentials.username,
        password: credentials.password,
      });

      // Stockage des jetons SimpleJWT de Django
      if (res.data.access) {
        localStorage.setItem("access_token", res.data.access);

        if (res.data.refresh) {
          localStorage.setItem("refresh_token", res.data.refresh);
        }

        router.push("/dashboard");
      } else {
        setError(
          "Réponse du serveur invalide (jeton manquant)."
        );
      }
    } catch (err: any) {
      console.error("Erreur de connexion :", err);

      if (err.response?.status === 401) {
        setError(
          "Nom d'utilisateur ou mot de passe incorrect."
        );
      } else {
        setError(
          "Impossible de se connecter au serveur. Vérifiez votre connexion."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            La Casa Da Festa Elisabeth
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Connexion à l'application Elisabeth
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Nom d'utilisateur */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Nom d'utilisateur
            </label>

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
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>

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
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-md
                       transition duration-200
                       disabled:opacity-50
                       disabled:cursor-not-allowed"
          >
            {loading
              ? "Connexion en cours..."
              : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}