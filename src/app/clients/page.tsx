"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

import ClientTable from "@/components/clients/ClientTable";


export interface Client {
  id: number | string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data
  ) {
    const results = (data as PaginatedResponse<T>).results;

    if (Array.isArray(results)) {
      return results;
    }
  }

  return [];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * ==========================================================
       * URL API
       * ==========================================================
       *
       * API_ROUTES.CLIENTS = /clients/
       *
       * api.ts ajoute automatiquement :
       *
       * http://127.0.0.1:8000/api
       *
       * Résultat :
       *
       * http://127.0.0.1:8000/api/clients/?page_size=1000
       */
      const url = `${API_ROUTES.CLIENTS}?page_size=1000`;

      console.log("[CLIENTS] GET :", url);

      const response = await api.get(url);

      console.log("[CLIENTS] HTTP :", response.status);
      console.log("[CLIENTS] DATA :", response.data);

      const clientsList = extractList<Client>(response.data);

      console.log(
        "[CLIENTS] NOMBRE DE CLIENTS :",
        clientsList.length
      );

      console.log(
        "[CLIENTS] CLIENTS :",
        clientsList
      );

      setClients(clientsList);
    } catch (requestError: unknown) {
      console.error(
        "[CLIENTS] ERREUR CHARGEMENT :",
        requestError
      );

      let message =
        "Impossible de charger les clients.";

      if (
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError
      ) {
        const response = (
          requestError as {
            response?: {
              status?: number;
              data?: {
                detail?: string;
                message?: string;
              };
            };
          }
        ).response;

        if (response?.status === 401) {
          message =
            "Session expirée ou authentification requise.";
        } else if (response?.status === 403) {
          message =
            "Vous n'avez pas l'autorisation d'accéder aux clients.";
        } else if (response?.data?.detail) {
          message = response.data.detail;
        } else if (response?.data?.message) {
          message = response.data.message;
        }
      }

      setError(message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  return (
    <section className="min-h-screen space-y-6 bg-slate-950 p-6 text-slate-100">
      {/* ========================================================
          EN-TÊTE
      ======================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Gestion de la clientèle
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Clients
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Clients enregistrés à partir des réservations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadClients()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Actualiser
        </button>
      </div>

      {/* ========================================================
          ERREUR
      ======================================================== */}
      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/50 p-4">
          <p className="font-medium text-red-300">
            {error}
          </p>

          <p className="mt-1 text-sm text-red-400">
            Vérifie également la console du navigateur pour
            voir la réponse exacte de l&apos;API.
          </p>
        </div>
      )}

      {/* ========================================================
          CHARGEMENT
      ======================================================== */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-6 w-6 animate-spin" />

            <span>
              Chargement des clients...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ====================================================
              TABLEAU
          ==================================================== */}
          <ClientTable clients={clients} />
        </>
      )}
    </section>
  );
}

