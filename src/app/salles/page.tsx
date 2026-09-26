"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Hall {
  id: number;
  name: string;
  description?: string | null;
  capacity?: number | null;
  price?: number | string | null;
  is_active?: boolean;
}

export default function SallesPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHalls = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(API_ROUTES.HALLS);

      const data = response.data;

      setHalls(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : []
      );
    } catch (err) {
      console.error("Erreur chargement salles :", err);
      setError("Impossible de charger les salles.");
      setHalls([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHalls();
  }, [loadHalls]);

  async function refreshHalls() {
    setRefreshing(true);
    await loadHalls();
  }

  async function deleteHall(id: number) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette salle ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`${API_ROUTES.HALLS}${id}/`);

      await loadHalls();
    } catch (err) {
      console.error("Erreur suppression salle :", err);
      setError("Impossible de supprimer cette salle.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="text-sm text-slate-400">
              Chargement des salles...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* EN-TÊTE */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Salles
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Gestion des salles disponibles pour les réservations.
            </p>
          </div>

          {/* UN SEUL BOUTON AJOUTER */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshHalls}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Actualiser
            </button>

            <Link
              href="/salles/nouvelle"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Ajouter une salle
            </Link>
          </div>
        </section>

        {/* ERREUR */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* LISTE */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold">
              Liste des salles
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {halls.length} salle(s) enregistrée(s)
            </p>
          </div>

          {halls.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-slate-400">
                Aucune salle enregistrée.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-950/70">
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Salle</th>
                    <th className="px-5 py-4">Description</th>
                    <th className="px-5 py-4">Capacité</th>
                    <th className="px-5 py-4">Prix</th>
                    <th className="px-5 py-4">État</th>
                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {halls.map((hall, index) => (
                    <tr
                      key={hall.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-white">
                          {hall.name}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-sm text-slate-400">
                        {hall.description || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {hall.capacity != null
                          ? `${hall.capacity} personnes`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {hall.price != null
                          ? `${Number(hall.price).toLocaleString("fr-FR")} $`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            hall.is_active === false
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {hall.is_active === false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/salles/${hall.id}/modifier`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modifier
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteHall(hall.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}